import os
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiEmbeddingFunction(EmbeddingFunction):
    """
    Custom embedding function for ChromaDB utilizing the Google Gemini API.
    """
    def __call__(self, input: Documents) -> Embeddings:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables.")
        
        # Ensure the API is configured with the correct key
        genai.configure(api_key=api_key)
        
        try:
            # genai.embed_content accepts a list of texts and returns a list of embeddings
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=input,
                task_type="retrieval_document"
            )
            return result["embedding"]
        except Exception as e:
            print(f"Error calling Gemini Embedding API: {e}")
            raise RuntimeError(f"Failed to generate embeddings from Gemini API: {str(e)}")

class PaperEmbedder:
    def __init__(self):
        # Configure Gemini API key on initialization if available
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            
        self.embedding_function = GeminiEmbeddingFunction()
        # Use an ephemeral client for clean in-memory indexing of fetched papers per query
        self.client = chromadb.EphemeralClient()

    def index_papers(self, papers: list, collection_name: str = "research_papers"):
        """
        Chunks and embeds paper abstracts, storing them in a fresh ChromaDB collection.
        """
        try:
            self.client.delete_collection(collection_name)
        except Exception:
            pass

        collection = self.client.create_collection(
            name=collection_name,
            embedding_function=self.embedding_function
        )

        documents = []
        metadatas = []
        ids = []

        for paper in papers:
            text = paper["summary"]
            chunks = self.chunk_text(text, chunk_size=80, overlap=20)
            
            for i, chunk in enumerate(chunks):
                documents.append(chunk)
                metadatas.append({
                    "paper_id": paper["id"],
                    "title": paper["title"],
                    "authors": ", ".join(paper["authors"]),
                    "year": paper["year"],
                    "chunk_index": i
                })
                ids.append(f"{paper['id']}_chunk_{i}")

        if documents:
            collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
        return collection

    def chunk_text(self, text: str, chunk_size: int = 80, overlap: int = 20) -> list:
        """
        Splits text into overlapping chunks of words.
        """
        words = text.split()
        if len(words) <= chunk_size:
            return [text]

        chunks = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start += (chunk_size - overlap)
            if start >= len(words):
                break
        return chunks

    def query_context(self, collection_name: str, query: str, top_k: int = 5) -> str:
        """
        Queries ChromaDB for the top_k most relevant chunks and returns formatted context.
        """
        try:
            collection = self.client.get_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
            results = collection.query(
                query_texts=[query],
                n_results=min(top_k, collection.count())
            )

            context_parts = []
            if results and 'documents' in results and results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    metadata = results['metadatas'][0][i]
                    context_parts.append(
                        f"Paper: {metadata['title']} ({metadata['year']})\n"
                        f"Authors: {metadata['authors']}\n"
                        f"Excerpt: {doc}\n"
                        f"Link: {metadata['paper_id']}\n"
                        f"---"
                    )
            return "\n\n".join(context_parts)
        except Exception as e:
            print(f"Error querying ChromaDB: {e}")
            return ""

if __name__ == "__main__":
    # Test stub
    print("Testing PaperEmbedder setup...")
    try:
        embedder = PaperEmbedder()
        print("Success initializing PaperEmbedder.")
        papers_test = [{
            "id": "http://arxiv.org/abs/1",
            "title": "A Test Paper on Artificial Intelligence",
            "authors": ["John Doe", "Jane Smith"],
            "year": "2025",
            "summary": "This paper presents a novel approach to artificial intelligence using transformer models and RAG."
        }]
        embedder.index_papers(papers_test, "test_collection")
        context = embedder.query_context("test_collection", "transformer models", top_k=1)
        print("Query context result:\n", context)
    except Exception as ex:
        print("Embedder test failed:", ex)
