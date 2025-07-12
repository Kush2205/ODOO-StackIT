from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from transformers import AutoTokenizer, AutoModel, pipeline, AutoModelForSeq2SeqLM
import torch
import requests

router = APIRouter()

# Load MiniLM model and tokenizer (for tag suggestion and next word prediction)
tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
# Load summarization pipeline (local model)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
# Load T5-small summarization pipeline (local model)
t5_summarizer = pipeline("summarization", model="t5-small")

# Dummy tag list and embeddings (replace with your tag list and precomputed embeddings)
TAGS = ["React", "JWT", "Authentication", "Python", "FastAPI", "MongoDB"]
TAG_EMBEDDINGS = None  # To be initialized on first request

class TagSuggestRequest(BaseModel):
    title: str
    description: str

class TagSuggestResponse(BaseModel):
    suggested_tags: List[str]

class SummarizeRequest(BaseModel):
    content: str
    model: str = "bart"  # "bart" or "t5"

class SummarizeResponse(BaseModel):
    summary: str

class NextWordRequest(BaseModel):
    text: str

class NextWordResponse(BaseModel):
    predictions: List[str]

# Helper to compute embeddings
def embed_text(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state[:, 0, :]
    return embeddings[0].numpy()

def get_tag_embeddings():
    global TAG_EMBEDDINGS
    if TAG_EMBEDDINGS is None:
        TAG_EMBEDDINGS = [embed_text(tag) for tag in TAGS]
    return TAG_EMBEDDINGS

@router.post("/ai/suggest-tags", response_model=TagSuggestResponse)
def suggest_tags(req: TagSuggestRequest):
    tag_embeddings = get_tag_embeddings()
    question_embedding = embed_text(req.title + " " + req.description)
    # Compute cosine similarity
    from sklearn.metrics.pairwise import cosine_similarity
    sims = cosine_similarity([question_embedding], tag_embeddings)[0]
    top_indices = sims.argsort()[-3:][::-1]
    suggested = [TAGS[i] for i in top_indices]
    return TagSuggestResponse(suggested_tags=suggested)

@router.post("/ai/summarize-answer", response_model=SummarizeResponse)
def summarize_answer(req: SummarizeRequest):
    # Use local HuggingFace summarization model (BART or T5)
    try:
        if req.model == "t5":
            summary_list = t5_summarizer(req.content, max_length=60, min_length=15, do_sample=False)
        else:
            summary_list = summarizer(req.content, max_length=60, min_length=15, do_sample=False)
        summary = summary_list[0]["summary_text"] if summary_list else ""
        return SummarizeResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@router.post("/ai/next-word", response_model=NextWordResponse)
def next_word(req: NextWordRequest):
    # Use MiniLM for next word prediction (not ideal, but for demo)
    # In practice, use a language model like GPT-2 offline
    input_ids = tokenizer.encode(req.text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(input_ids)
    # This is a placeholder: MiniLM is not a generative model
    # For demo, return most likely next tokens from vocab
    next_tokens = tokenizer.convert_ids_to_tokens(torch.topk(outputs.last_hidden_state[0, -1], 5).indices)
    return NextWordResponse(predictions=next_tokens)
