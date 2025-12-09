import os
import uvicorn
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from typing import Optional

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME") 

if not API_KEY:
    raise ValueError("No GOOGLE_API_KEY found — set it in your .env")


genai.configure(api_key=API_KEY)

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
                    model = genai.GenerativeModel(model_name=c)
                    model.count_tokens("hi")
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
    print("Selected MODEL_NAME =", MODEL_NAME, "- if this fails, set MODEL_NAME in your .env to a supported model id")

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
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

    try:
        response = await asyncio.to_thread(chat_session.send_message, user_text)

        reply_text = getattr(response, "text", None)
        if reply_text is None:
            reply_text = str(response)

        return {"reply": reply_text, "mood": "neutral"}

    except Exception as e:
        print("Error during message processing:", repr(e))
        msg = str(e).lower()
        if "not found" in msg or "is not found" in msg:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Model not found or not accessible with this API key. "
                    "Run the list_models_check.py script to see available models and set MODEL_NAME in .env."
                )
            )
        raise HTTPException(status_code=500, detail="Error processing Gemini request.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
