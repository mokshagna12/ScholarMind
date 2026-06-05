import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List

# Load env variables (e.g. GEMINI_API_KEY) from .env file
load_dotenv()

class ResearchResponse(BaseModel):
    summary: str = Field(
        description="A synthesized summary answering the user's research topic or question based on the provided paper abstracts."
    )
    knowledge_gaps: List[str] = Field(
        description="Exactly 3 key knowledge gaps identified from the retrieved abstracts."
    )
    follow_up_questions: List[str] = Field(
        description="Exactly 5 suggested follow-up questions for students to further investigate the topic."
    )

class RAGPipeline:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
        else:
            genai.configure(api_key=self.api_key)

    def generate_research_synthesis(self, query: str, context: str) -> dict:
        """
        Runs RAG on the user query and the retrieved paper abstracts context,
        returning a structured dict matching ResearchResponse.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY environment variable is not set. Please add it to your environment."
            )

        prompt = f"""
You are an expert AI research assistant. Your task is to analyze the following retrieved arXiv paper abstracts and answer the user's research question or synthesize information for the topic.

User Query/Topic: {query}

Retrieved Paper Abstracts Context:
{context}

Based ONLY on the provided context, please output:
1. A synthesized summary addressing the user's query. It should be written in a professional, academic yet accessible tone, highlighting key findings, methodologies, and conclusions from the papers.
2. Exactly 3 key knowledge gaps or unsolved questions identified from this research.
3. Exactly 5 suggested follow-up questions that a student can research next to deepen their understanding of this topic.

You must output your response in JSON matching the requested schema. Do not make up information that cannot be supported by the abstracts.
"""

        try:
            # Configure or re-configure API key before running the model
            genai.configure(api_key=api_key)
            
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=ResearchResponse,
                    temperature=0.2,
                )
            )
            
            # Parse response text (JSON string) into dict
            result_dict = json.loads(response.text)
            return result_dict
            
        except Exception as e:
            print(f"Gemini API execution error: {e}")
            raise RuntimeError(f"Failed to generate synthesis from Gemini API: {str(e)}")

if __name__ == "__main__":
    # Test script if API key is set
    pipeline = RAGPipeline()
    if os.getenv("GEMINI_API_KEY"):
        print("API Key found. Attempting a mock generation...")
        mock_context = (
            "Paper: Attention Is All You Need (2017)\n"
            "Authors: Ashish Vaswani, et al.\n"
            "Excerpt: We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.\n"
            "---"
        )
        try:
            res = pipeline.generate_research_synthesis("Explain transformers", mock_context)
            print("Response:", json.dumps(res, indent=2))
        except Exception as ex:
            print("Failed:", ex)
    else:
        print("Skipping test because GEMINI_API_KEY is not set.")
