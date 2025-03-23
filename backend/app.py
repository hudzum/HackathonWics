from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from dataclasses import dataclass, field

app = FastAPI(title="Donation Game API")

# Forward reference for type hints
class Person: pass

@dataclass
class Goal:
    name: str
    item: str
    amount: int
    donations: int = 0
    people: List[Person] = field(default_factory=list)

    def add_person(self, person: "Person"):
        self.people.append(person)

    def remove_person(self, person: "Person"):
        self.people.remove(person)

@dataclass
class Person:
    name: str
    goal: Goal
    winstreak: int = 0
    donations: int = 0

    def donate(self, amount: int):
        self.donations += amount
        self.goal.donations += amount

    def join_game(self, game: "Game"):
        game.join_game(self)
        
    def leave_game(self, game: "Game"):
        game.leave_game(self)

@dataclass
class Game:
    name: str
    goal: Goal
    players: List[Person] = field(default_factory=list)
    winner: Optional[Person] = None
    
    def join_game(self, person: Person):
        self.players.append(person)

    def leave_game(self, person: Person):
        self.players.remove(person)

    def start_game(self):
        # Game startup logic would go here
        pass

    def end_game(self, winner: Person):
        self.winner = winner
        if winner.winstreak > 0:
            winner.winstreak += 1
        else:
            winner.winstreak = 1

# Pydantic models for API requests and responses
class GoalCreate(BaseModel):
    name: str
    item: str
    amount: int
    
class PersonCreate(BaseModel):
    name: str
    goal_name: str
    
class GameCreate(BaseModel):
    name: str
    goal_name: str
    
class DonationCreate(BaseModel):
    person_name: str
    amount: int

# In-memory storage
goals = {}
people = {}
games = {}

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Donation Game API"}

@app.post("/goals/", status_code=201)
async def create_goal(goal: GoalCreate):
    if goal.name in goals:
        raise HTTPException(status_code=400, detail="Goal already exists")
    new_goal = Goal(name=goal.name, item=goal.item, amount=goal.amount)
    goals[goal.name] = new_goal
    return {"message": f"Goal {goal.name} created successfully"}

@app.get("/goals/")
async def list_goals():
    return {"goals": list(goals.values())}

@app.get("/goals/{goal_name}")
async def get_goal(goal_name: str):
    if goal_name not in goals:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goals[goal_name]

@app.post("/people/", status_code=201)
async def create_person(person: PersonCreate):
    if person.name in people:
        raise HTTPException(status_code=400, detail="Person already exists")
    if person.goal_name not in goals:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    new_person = Person(name=person.name, goal=goals[person.goal_name])
    people[person.name] = new_person
    goals[person.goal_name].add_person(new_person)
    return {"message": f"Person {person.name} created successfully"}

@app.get("/people/")
async def list_people():
    return {"people": list(people.values())}

@app.post("/games/", status_code=201)
async def create_game(game: GameCreate):
    if game.name in games:
        raise HTTPException(status_code=400, detail="Game already exists")
    if game.goal_name not in goals:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    new_game = Game(name=game.name, goal=goals[game.goal_name])
    games[game.name] = new_game
    return {"message": f"Game {game.name} created successfully"}

@app.post("/games/{game_name}/join")
async def join_game(game_name: str, person_name: str):
    if game_name not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    if person_name not in people:
        raise HTTPException(status_code=404, detail="Person not found")
    
    games[game_name].join_game(people[person_name])
    return {"message": f"{person_name} joined game {game_name}"}

@app.post("/donate/")
async def make_donation(donation: DonationCreate):
    if donation.person_name not in people:
        raise HTTPException(status_code=404, detail="Person not found")
    
    person = people[donation.person_name]
    person.donate(donation.amount)
    return {"message": f"Donation of {donation.amount} made by {donation.person_name}"}

@app.post("/games/{game_name}/end")
async def end_game(game_name: str, winner_name: str):
    if game_name not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    if winner_name not in people:
        raise HTTPException(status_code=404, detail="Winner not found")
    
    games[game_name].end_game(people[winner_name])
    return {"message": f"Game {game_name} ended with {winner_name} as winner"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


