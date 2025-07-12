from fastapi import FastAPI, Request
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def load_model():
    app.state.tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
    app.state.model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small")
    app.state.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    app.state.model.to(app.state.device)

@app.post("/summarize")
async def summarize(request: Request):
    data = await request.json()
    question = data.get("question", "")
    answers = data.get("answers", [])[:5]  


    combined_text = f"Q: {question}\n" + "".join([f"A{i+1}: {ans}\n" for i, ans in enumerate(answers)])
    input_text = f"summarize: {combined_text}"

    tokenizer = request.app.state.tokenizer
    model = request.app.state.model
    device = request.app.state.device


    inputs = tokenizer.encode(input_text, return_tensors="pt", truncation=True, max_length=512).to(device)
    summary_ids = model.generate(inputs, max_length=100, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return {"summary": summary}

