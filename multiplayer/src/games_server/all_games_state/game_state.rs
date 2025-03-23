use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, PartialEq)]
#[derive(Clone)]
#[serde(tag="type")]
pub enum Direction {
    Up,
    Down,
    Left,
    Right
}

impl Direction {
    pub fn opposite(&self) -> Direction {
        match self {
            Direction::Up => Direction::Down,
            Direction::Down => Direction::Up,
            Direction::Left => Direction::Right,
            Direction::Right => Direction::Left,
        }
    }
}

#[derive(Debug)]
pub struct AliveSnake {
    pub user_id: String,
    pub head: (u32, u32),
    pub head_direction: Direction,
    /// Direction to continue the snake plus the number of blocks in that direction
    pub blocks: Vec<(Direction, u32)>,
    pub invulnerable_for: Option<u64>,
    pub frozen_for: Option<u64>,
    pub has_extra_life: bool
}

#[derive(Debug)]
pub enum Snake {
    Alive(AliveSnake),
    Dead {user_id: String, head: (u32, u32), ticks_to_revive: Option<u64>}
}

#[derive(Debug)]
pub enum GameState {
    WaitingForPlayers {
        ready_status: HashMap<String, bool>
    },
    Playing {
        snakes: HashMap<String, Snake>,
        apples: Vec<(u32, u32)>,
        /// tracks how much each user id has spent
        amounts_spent: HashMap<String, f64>
    },
    GameOver {
        winner: String,
        amounts_spent: Vec<(String, f64)>
    }
}
