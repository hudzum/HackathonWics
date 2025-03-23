use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use bytes::Bytes;
use tokio::sync::{broadcast, mpsc, RwLock};
use game_state::GameState;
use crate::games_server::client_message::ClientMessage;
use crate::games_server::server_message::ServerMessage;

pub mod game_state;

#[derive(Clone, Debug)]
pub struct GameIncomingMessage {
    pub player_id: String,
    pub message: ClientMessage
}

#[derive(Clone, Debug)]
pub struct GameOutgoingMessage {
    pub to_player: String,
    pub message: ServerMessage,
}

pub struct AuthGameState {
    /// map of access tokens to player ids
    pub players: HashMap<String, String>,
    /// 
    pub to_players: broadcast::Receiver<GameOutgoingMessage>,
    pub game: Arc<Mutex<GameState>>,
    pub sender: mpsc::Sender<GameIncomingMessage>,
}

pub struct AllGamesState {
    pub games: RwLock<HashMap<String, AuthGameState>>
}
