# Donation Game API

A FastAPI-based backend for a donation game application.

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Run the application:
```
cd backend
python app.py
```

The API will be available at http://localhost:8000

## API Documentation

FastAPI automatically generates interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- `GET /` - Welcome message
- `POST /goals/` - Create a new goal
- `GET /goals/` - List all goals
- `GET /goals/{goal_name}` - Get details of a specific goal
- `POST /people/` - Create a new person
- `GET /people/` - List all people
- `POST /games/` - Create a new game
- `POST /games/{game_name}/join` - Join a game
- `POST /donate/` - Make a donation
- `POST /games/{game_name}/end` - End a game 