from fastapi import FastAPI
from routes import questions, answers, auth, notifications, admin, flags

app = FastAPI()

app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(answers.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(flags.router)
