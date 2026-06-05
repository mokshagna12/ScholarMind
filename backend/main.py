import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import uvicorn

from arxiv_fetch import search_arxiv
from embedder import PaperEmbedder
from rag import RAGPipeline

app = FastAPI(
    title="ScholarMind API",
    description="Backend API for AI-powered research synthesis",
    version="1.0.0"
)

# Enable CORS for React frontend (defaulting to http://localhost:5173 for Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev we can allow all, or restrict to specific localhost ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pipelines globally (loads model on startup)
print("Initializing ScholarMind components...")
try:
    embedder = PaperEmbedder()
    rag_pipeline = RAGPipeline()
    print("ScholarMind components loaded successfully.")
except Exception as e:
    print(f"Error during startup initialization: {e}")
    # We will still let the app run so the server doesn't crash immediately,
    # but requests will fail gracefully with clear explanations.
    embedder = None
    rag_pipeline = None

class ResearchRequest(BaseModel):
    query: str = Field(..., example="Quantum computing error correction")

class PaperInfo(BaseModel):
    id: str
    title: str
    authors: List[str]
    year: str
    summary: str

class ResearchResponseModel(BaseModel):
    summary: str
    knowledge_gaps: List[str]
    follow_up_questions: List[str]
    papers: List[PaperInfo]

@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": embedder is not None,
        "gemini_api_key_configured": os.getenv("GEMINI_API_KEY") is not None
    }

@app.post("/api/research", response_model=ResearchResponseModel)
async def perform_research(request: ResearchRequest):
    """
    Main research endpoint.
    Fetches papers, embeds and indexes them in ChromaDB, queries context,
    and runs Gemini 2.5 RAG to output structured summary, gaps, and follow-ups.
    """
    query_text = request.query.strip()
    if not query_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty."
        )

    # 1. Check dependency status
    if embedder is None or rag_pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server initialization failed. Model or RAG pipeline could not be loaded."
        )

    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY environment variable is not set. Please add it to your environment."
        )

    # 2. Fetch papers from arXiv
    try:
        print(f"Fetching papers for query: '{query_text}'")
        papers = search_arxiv(query_text, max_results=10)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"arXiv API fetch error: {str(e)}"
        )

    if not papers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No relevant papers found on arXiv for: '{query_text}'. Try a different research term."
        )

    # 3. Index papers in ChromaDB
    try:
        print(f"Indexing {len(papers)} papers in ChromaDB...")
        embedder.index_papers(papers, collection_name="research_papers")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vector database indexing failed: {str(e)}"
        )

    # 4. Query context for RAG
    try:
        print("Retrieving context from ChromaDB...")
        context = embedder.query_context("research_papers", query_text, top_k=5)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying context: {str(e)}"
        )

    # 5. Run RAG synthesis with Gemini
    try:
        print("Generating research synthesis with Gemini 2.5 Flash...")
        synthesis = rag_pipeline.generate_research_synthesis(query_text, context)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {str(e)}"
        )

    # 6. Build response
    response_data = {
        "summary": synthesis.get("summary", ""),
        "knowledge_gaps": synthesis.get("knowledge_gaps", []),
        "follow_up_questions": synthesis.get("follow_up_questions", []),
        "papers": papers
    }

    return response_data

# Serve static files if they exist (used for unified Docker/HuggingFace/Render deployment)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
