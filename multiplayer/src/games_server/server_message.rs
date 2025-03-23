use serde::Serialize;
use crate::games_server::all_games_state::game_state::{Direction, Snake};
use crate::games_server::power_ups::PowerUps;

#[derive(Debug, Serialize)]
#[serde(tag = "type")]
#[derive(Clone)]
pub enum SentSnake {
    Alive { user_id: String, head: (u32, u32), head_direction: Direction, blocks: Vec<(Direction, u32)>, invulnerable: bool, frozen: bool, has_extra_life: bool },
    Dead { user_id: String, revive_left: u64 },
}

impl Into<SentSnake> for &Snake {
    fn into(self) -> SentSnake {
        match self {
            Snake::Alive(snake) => SentSnake::Alive {
                invulnerable: snake.invulnerable_for.is_some(),
                frozen: snake.frozen_for.is_some(),
                user_id: snake.user_id.to_string(),
                head: snake.head,
                head_direction: snake.head_direction.clone(),
                blocks: snake.blocks.clone(),
                has_extra_life: snake.has_extra_life,
            },
            Snake::Dead { user_id, ticks_to_revive, .. } => SentSnake::Dead { 
                user_id: user_id.clone(),
                revive_left: match ticks_to_revive {
                    Some(ticks) => *ticks,
                    None => 0,
                }
            }
        }
    }
}

#[derive(Debug, Serialize)]
#[derive(Clone)]
pub struct ReadyStatus {
    pub user_id: String,
    pub ready: bool
}

#[derive(Debug, Serialize)]
#[derive(Clone)]
pub struct AmountSpent {
    pub user_id: String,
    pub amount_spent: f64
}

#[derive(Debug, Serialize)]
#[derive(Clone)]
pub struct RecentPowerUp {
    pub user_id: String,
    pub power_up: PowerUps
}

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type")]
pub enum ServerMessage {
    Authenticated,
    /// vector of 
    ReadyStatus{status:Vec<ReadyStatus>},
    StartGame,
    GameOver {winner: String, amounts_spent: Vec<AmountSpent>},
    GameState { apples: Vec<(u32, u32)>, snakes: Vec<SentSnake>, just_ate_apple: Vec<String>, recent_power_ups: Vec<RecentPowerUp> }
}
