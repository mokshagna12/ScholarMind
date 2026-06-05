# Deployment Guide — ScholarMind

Since ScholarMind relies on a local Hugging Face embedding model (`all-MiniLM-L6-v2`) and local indexing in ChromaDB, the python backend requires a reasonable amount of RAM (around 300–400MB) to run smoothly. 

We have packaged the entire application into a single **multi-stage Dockerfile** that builds the React frontend and serving folder in one step, running under a FastAPI uvicorn daemon.

Here are the best ways to deploy this project completely for free:

---

## Recommended: Hugging Face Spaces (100% Free, 16GB RAM, 2 vCPUs)
Hugging Face Spaces offers a massive free tier of 16GB RAM with zero credit card requirements, making it perfect for hosting PyTorch-based models and embedding databases.

### Steps to Deploy:
1. Sign in to your [Hugging Face](https://huggingface.co/) account.
2. Click on **New Space** (or go to `huggingface.co/new-space`).
3. Set your settings:
   - **Space Name**: `ScholarMind`
   - **License**: `mit` (or choose yours)
   - **SDK**: Select **Docker** (Very Important!)
   - **Docker template**: Select **Blank** (default)
   - **Space Hardware**: CPU Basic (Free, 16GB RAM)
   - **Visibility**: Public (or Private)
4. Click **Create Space**.
5. Once created, Hugging Face will show you git instructions to push your code. Since you already initialized Git locally, you can just link it as a remote:
   ```bash
   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   ```
6. **Set up Secrets**:
   - In your Hugging Face Space page, navigate to **Settings** ➔ **Variables and secrets**.
   - Under **Secrets**, click **New secret**.
   - Key: `GEMINI_API_KEY`
   - Value: *[Your Gemini API Key]*
7. **Push your code**:
   ```bash
   git push -f hf main
   ```
   Hugging Face will automatically read the `Dockerfile`, compile your React app, install python requirements, and start your full-stack service on port `7860`.

---

## Alternative: Render (Free, 512MB RAM)
Render offers a free tier for Docker web services. However, due to the 512MB RAM cap on Render’s free tier, loading PyTorch and `sentence-transformers` might occasionally trigger Out Of Memory (OOM) failures under heavy load.

### Steps to Deploy:
1. Push your ScholarMind code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [Render](https://render.com/).
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. In the settings page:
   - **Name**: `scholarmind`
   - **Runtime**: Select **Docker** (it will read our multi-stage `Dockerfile`)
   - **Instance Type**: **Free**
6. Under **Advanced Settings**:
   - Add Environment Variable:
     - Key: `GEMINI_API_KEY`
     - Value: *[Your Gemini API Key]*
7. Click **Create Web Service**. 
   Render will build the container and deploy it automatically.
