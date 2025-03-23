use serde::Deserialize;
use crate::games_server::all_games_state::game_state::Direction;
use crate::games_server::power_ups::PowerUps;

#[derive(Debug, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum ClientMessage {
    Authenticate {access_token: String, game_id: String},
    UsePowerUp {power_up: PowerUps},
    SetDirection {direction: Direction},
    SetReady {ready: bool},
}
