# main.py
import os
import uvicorn
import asyncio
import time
import uuid
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import requests

# Load local .env in development ONLY
load_dotenv()

# -------------------------
# Configuration (env vars)
# -------------------------
API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")

# Spotify credentials (optional; add on Render for production)
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

if not API_KEY:
    raise ValueError("No GOOGLE_API_KEY found — set it in your .env or Render environment variables")

genai.configure(api_key=API_KEY)

# -------------------------
# Utility: list available models (debug)
# -------------------------
def print_available_models():
    try:
        resp = genai.list_models()
        print("list_models() response (raw):", resp)
        try:
            models = resp.models
        except Exception:
            models = resp
        print("Available models (first 40):")
        count = 0
        for m in models:
            count += 1
            if count > 40:
                break
            name = getattr(m, "name", None) or (m.get("name") if isinstance(m, dict) else None) or str(m)
            print(" -", name)
    except Exception as e:
        print("Could not list models via SDK:", e)
        print('As fallback, run this curl command to see models:')
        print('curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"')

print_available_models()

# -------------------------
# If MODEL_NAME not provided, pick a candidate that works
# -------------------------
if not MODEL_NAME:
    candidate = [
        "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash",
        "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5"
    ]
    chosen = None
    for c in candidate:
        try:
            def probe():
                try:
                    model_probe = genai.GenerativeModel(model_name=c)
                    model_probe.count_tokens("hi")
                    return True
                except Exception:
                    return False
            ok = asyncio.get_event_loop().run_until_complete(asyncio.to_thread(probe))
            if ok:
                chosen = c
                break
        except Exception:
            continue
    MODEL_NAME = chosen or candidate[0]
    print("Selected MODEL_NAME =", MODEL_NAME, "- if this fails, set MODEL_NAME in .env to a supported model id")

# -------------------------
# System instruction & model init
# -------------------------
SYSTEM_INSTRUCTION = """
You are Luka, a compassionate, warm, and empathetic AI companion.
- Your goal is to listen, validate feelings, and provide gentle support.
- If the user seems sad, offer comforting words.
- Keep responses conversational and concise (2-3 sentences max usually).
- Do NOT act like a robot; use a human-like, caring tone.
- If user is demotivated motivate the user by providing motivating quotes and advices.
- If a user expresses intent for self-harm, gently urge them to seek professional help.
"""

try:
    model = genai.GenerativeModel(model_name=MODEL_NAME, system_instruction=SYSTEM_INSTRUCTION)
    chat_session = model.start_chat(history=[])
    print("Started chat session with model:", MODEL_NAME)
except Exception as e:
    print("Failed to instantiate GenerativeModel with", MODEL_NAME, ":", e)
    raise

# -------------------------
# Simple local emotion detector (keyword-based)
# -------------------------
EMO_KEYWORDS = {
    "sad": ["sad", "depressed", "down", "miserable", "lonely", "tear", "tears"],
    "happy": ["happy", "glad", "joy", "excited", "awesome", "great", "good", "fantastic"],
    "angry": ["angry", "mad", "furious", "annoyed", "irritated"],
    "anxious": ["anxious", "anxiety", "nervous", "worried", "panic"],
    "stressed": ["stressed", "overwhelmed", "burnout", "pressure"],
}

def detect_emotion_local(text: str) -> str:
    t = text.lower()
    counts: Dict[str,int] = {}
    for label, keys in EMO_KEYWORDS.items():
        for k in keys:
            if k in t:
                counts[label] = counts.get(label, 0) + 1
    if not counts:
        return "neutral"
    return max(counts.items(), key=lambda x: x[1])[0]

# -------------------------
# Spotify helper (Client Credentials flow)
# -------------------------
_SPOTIFY_TOKEN: Optional[str] = None
_SPOTIFY_TOKEN_EXPIRES_AT: float = 0.0

def get_spotify_token_sync() -> Optional[str]:
    """Synchronously fetch and cache a Spotify token using client credentials flow."""
    global _SPOTIFY_TOKEN, _SPOTIFY_TOKEN_EXPIRES_AT
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        return None
    now = time.time()
    if _SPOTIFY_TOKEN and now < _SPOTIFY_TOKEN_EXPIRES_AT - 30:
        return _SPOTIFY_TOKEN
    token_url = "https://accounts.spotify.com/api/token"
    data = {"grant_type": "client_credentials"}
    # requests will handle basic auth if you pass auth=(id, secret)
    try:
        resp = requests.post(token_url, data=data, auth=(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET), timeout=10)
    except Exception as e:
        print("Spotify token request failed:", e)
        return None
    if resp.status_code != 200:
        print("Spotify token failed:", resp.status_code, resp.text)
        return None
    j = resp.json()
    access_token = j.get("access_token")
    expires_in = j.get("expires_in", 3600)
    if access_token:
        _SPOTIFY_TOKEN = access_token
        _SPOTIFY_TOKEN_EXPIRES_AT = now + int(expires_in)
        return _SPOTIFY_TOKEN
    return None

async def get_spotify_token() -> Optional[str]:
    return await asyncio.to_thread(get_spotify_token_sync)

def spotify_search_track_sync(query: str) -> Optional[Dict[str,str]]:
    """Sync search: returns {url,name,artist} or None."""
    token = get_spotify_token_sync()
    if not token:
        return None
    search_url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"q": query, "type": "track", "limit": 1}
    try:
        resp = requests.get(search_url, headers=headers, params=params, timeout=8)
    except Exception as e:
        print("Spotify search failed:", e)
        return None
    if resp.status_code != 200:
        print("Spotify search non-200:", resp.status_code, resp.text)
        return None
    j = resp.json()
    items = j.get("tracks", {}).get("items", [])
    if not items:
        return None
    t = items[0]
    external = t.get("external_urls", {}).get("spotify")
    name = t.get("name", "")
    artist = ""
    artists = t.get("artists", [])
    if artists and isinstance(artists, list):
        artist = artists[0].get("name", "")
    if not external:
        return None
    return {"url": external, "name": name or "", "artist": artist or ""}

async def spotify_search_track(query: str) -> Optional[Dict[str,str]]:
    return await asyncio.to_thread(spotify_search_track_sync, query)

EMOTION_TO_QUERY = {
    "sad": "melancholic acoustic sad song",
    "happy": "upbeat happy pop song",
    "stressed": "calm relaxing instrumental",
    "anxious": "calming ambient music",
    "angry": "energetic rock angry song",
    "neutral": "chill indie song"
}

# -------------------------
# FastAPI setup
# -------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # for production, replace "*" with your frontend domain
    allow_methods=["POST", "OPTIONS", "GET"],
    allow_headers=["*", "Content-Type"],
)

class UserRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request_body: UserRequest):
    user_text = (request_body.message or "").strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty message provided.")

    # crisis checks
    crisis_keywords = ["suicide", "end it all", "kill myself", "i want to die", "i'm going to kill myself"]
    if any(word in user_text.lower() for word in crisis_keywords):
        return {
            "reply": (
                "I'm hearing that you are in a lot of pain right now. Please, your life matters. "
                "If you are in immediate danger or thinking about hurting yourself, call your local emergency number or a crisis hotline right now. "
                "In the U.S. you can call or text 988 for the Suicide & Crisis Lifeline."
            ),
            "mood": "crisis"
        }

    # detect emotion locally
    emotion_local = detect_emotion_local(user_text)

    # Send to Gemini (non-blocking wrapper via to_thread)
    try:
        response_obj = await asyncio.to_thread(chat_session.send_message, user_text)
    except Exception as e:
        print("Error during message processing:", repr(e))
        msg = str(e).lower()
        if "not found" in msg or "is not found" in msg:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Model not found or not accessible with this API key. "
                    "Run the list_models_check or set MODEL_NAME in environment variables."
                )
            )
        raise HTTPException(status_code=500, detail="Error processing Gemini request.")

    reply_text = getattr(response_obj, "text", None)
    if reply_text is None:
        reply_text = str(response_obj)

    # Attempt Spotify search if credentials exist
    music_info = None
    if SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET:
        query = EMOTION_TO_QUERY.get(emotion_local, EMOTION_TO_QUERY["neutral"])
        try:
            found = await spotify_search_track(query)
            if found:
                music_info = found
        except Exception as e:
            print("Spotify search exception:", e)
            music_info = None

    result = {
        "reply": reply_text,
        "mood": emotion_local,
    }
    if music_info:
        result["music"] = music_info

    return result

@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_NAME}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
