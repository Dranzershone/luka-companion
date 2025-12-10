# 🤖 Luka: The AI Wellness Companion

**Luka** is a full-stack, empathetic companion chatbot designed to provide supportive conversation, motivation, and mood-based music recommendations for users experiencing sadness or demotivation. Built with modern, asynchronous technologies, Luka demonstrates expertise in conversational AI design, API integration, and full-stack deployment.

## 🚀 Features

  * **Empathetic Conversation:** Utilizes **Google Gemini 1.5 Flash** with a defined system persona for high-quality, reflective, and supportive dialogues.
  * **Safety First (Crisis Detection):** Implements a **hard-coded keyword filter** to immediately override the AI response and provide the **988 Crisis Lifeline** for user safety. (A commitment to **Responsible AI**).
  * **Mood-Based Music Recommendation (Future Feature):** Integration ready to map detected user sentiment (e.g., sadness) to a calculated uplift goal (e.g., high valence, moderate energy) and retrieve a suitable playlist via the **Spotify API (Spotipy)**.
  * **Asynchronous API:** Built with **FastAPI** to handle high concurrency, ensuring quick response times for a smooth user experience.
  * **Professional Frontend:** Modern, calm, and accessible user interface built with **React** and **Tailwind CSS**.

## 💻 Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend (Client)** | **React (Vite/TSX)**, Tailwind CSS | The responsive, single-page application (SPA) UI. |
| **Backend (API)** | **Python 3.12**, **FastAPI** | High-performance, asynchronous REST API server. |
| **AI Core** | **Google Gemini 2.5 Flash** | Large Language Model (LLM) for conversation generation. |
| **External APIs** | **Spotify Web API** (via `Spotipy`) | Music search and playlist recommendation. |
| **Environment** | **`python-dotenv`** | Secure management of API keys and secrets. |

## 🛠️ Installation and Setup

### **1. Clone the Repository**

```bash
git clone <your-repository-url>
cd Luka-Project
```

### **2. Backend Setup (Python/FastAPI)**

It is critical to use a virtual environment to manage dependencies.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a new virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1 # Use 'source .venv/bin/activate' on Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### **3. API Key Configuration**

Create a file named **`.env`** inside the `backend/` folder and populate it with your credentials:

```env
# Get keys from Google AI Studio and Spotify Developer Dashboard
GOOGLE_API_KEY="AIzaSy..."
SPOTIPY_CLIENT_ID="your_spotify_client_id"
SPOTIPY_CLIENT_SECRET="your_spotify_client_secret"
```

### **4. Frontend Setup (React/Node)**

```bash
# Navigate to the frontend directory
cd ../luka-companion-main

# Install Node dependencies (assuming npm/yarn/pnpm is installed)
npm install
```

## ▶️ Running the Application

You must run the backend and frontend simultaneously, ideally in two separate terminals within the VS Code root folder.

### **Terminal 1: Start the Backend (API Server)**

```bash
cd backend
.\.venv\Scripts\Activate.ps1
python main.py
```

*(The server will run on `http://127.0.0.1:8000`)*

### **Terminal 2: Start the Frontend (Web Client)**

```bash
cd luka-companion-main
npm run dev
```

*(The client will usually open at `http://localhost:5173`)*

## 🤝 Next Steps and Future Improvements

  * **Memory Persistence:** Implement a PostgreSQL database to store conversation history and user mood data, moving the `chat_session` from global memory to a database for multi-user support.
  * **Advanced Sentiment:** Integrate a specialized model (e.g., Hugging Face) for nuanced emotion detection beyond keywords (e.g., distinguishing anxiety from sadness).
  * **User Authentication:** Add login/user profiles to personalize the companion experience.
  * **Deployment:** Containerize the backend using **Docker** and deploy the full stack to a cloud platform (e.g., Render or AWS) for production readiness.
