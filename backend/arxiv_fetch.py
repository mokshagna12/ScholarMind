import urllib.parse
import xml.etree.ElementTree as ET
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import re

def create_session():
    session = requests.Session()
    retry = Retry(
        total=4,
        backoff_factor=3,
        status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

def search_arxiv(query: str, max_results: int = 10) -> list:
    """
    Search arXiv API for the given query and parse the XML results.
    Returns a list of dicts with keys: id, title, authors, year, summary.
    """
    # Clean the query for URL embedding
    encoded_query = urllib.parse.quote(query)
    url = f"http://export.arxiv.org/api/query?search_query=all:{encoded_query}&start=0&max_results={max_results}&sortBy=relevance"
    
    session = create_session()
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching from arXiv: {e}")
        raise RuntimeError(f"Failed to fetch papers from arXiv: {str(e)}")

    # Parse XML response
    try:
        root = ET.fromstring(response.content)
    except ET.ParseError as e:
        print(f"XML parsing error: {e}")
        raise RuntimeError(f"Failed to parse arXiv search results: {str(e)}")

    # Atom namespace maps
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    
    papers = []
    
    for entry in root.findall('atom:entry', ns):
        # Extract title and clean spacing
        title_elem = entry.find('atom:title', ns)
        title = ""
        if title_elem is not None and title_elem.text:
            title = re.sub(r'\s+', ' ', title_elem.text).strip()
            
        # Extract abstract/summary and clean spacing
        summary_elem = entry.find('atom:summary', ns)
        summary = ""
        if summary_elem is not None and summary_elem.text:
            summary = re.sub(r'\s+', ' ', summary_elem.text).strip()
            
        # Extract id/link
        id_elem = entry.find('atom:id', ns)
        paper_id = ""
        if id_elem is not None and id_elem.text:
            paper_id = id_elem.text.strip()
            
        # Extract published date and extract year
        published_elem = entry.find('atom:published', ns)
        year = "N/A"
        if published_elem is not None and published_elem.text:
            # Format is usually YYYY-MM-DDTHH:MM:SSZ
            match = re.match(r'^(\d{4})', published_elem.text.strip())
            if match:
                year = match.group(1)
                
        # Extract authors
        authors = []
        for author in entry.findall('atom:author', ns):
            name_elem = author.find('atom:name', ns)
            if name_elem is not None and name_elem.text:
                authors.append(name_elem.text.strip())
                
        # Only add papers with a title and summary
        if title and summary:
            papers.append({
                "id": paper_id,
                "title": title,
                "authors": authors,
                "year": year,
                "summary": summary
            })
            
    return papers

if __name__ == "__main__":
    # Test fetch
    try:
        results = search_arxiv("Attention is all you need", max_results=3)
        for i, paper in enumerate(results):
            print(f"[{i+1}] {paper['title']} ({paper['year']})")
            print(f"Authors: {', '.join(paper['authors'])}")
            print(f"URL: {paper['id']}")
            print(f"Summary: {paper['summary'][:100]}...\n")
    except Exception as ex:
        print(f"Test query failed: {ex}")
