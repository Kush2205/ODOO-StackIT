from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import questions, answers, auth, notifications, admin, flags, ai  # Import AI router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(answers.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(flags.router)
app.include_router(ai.router)  # Register AI routes
