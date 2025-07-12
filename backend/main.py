from fastapi import FastAPI
from routes import questions, answers, auth

app = FastAPI()

app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(answers.router)
