use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;
use serde::{Deserialize, Serialize};
use tokio::sync::{broadcast, mpsc};
use uuid::Uuid;
use crate::games_server::all_games_state::{AllGamesState, AuthGameState};
use crate::games_server::all_games_state::game_state::GameState;
use crate::games_server::game_runner::game_runner;
use crate::games_server::power_up_cost_loader::PowerUpCosts;

#[derive(Deserialize)]
pub struct CreateGamePayload {
    api_token: String,
    user_ids: Vec<String>
}

#[derive(Serialize)]
pub struct UserAccessToken {
    access_token: String,
    user_id: String,
}

#[derive(Serialize)]
#[serde(tag = "type")]
pub enum CreateGameResponse {
    Success {
        game_id: String,
        users: Vec<UserAccessToken>
    },
    Error
}

pub async fn create_game(
    State(state): State<Arc<AllGamesState>>,
    Json(payload): Json<CreateGamePayload>
) -> (StatusCode, Json<CreateGameResponse>) {
    // todo in the future, add proper authentication
    if payload.api_token != "secret_token" {
        return (StatusCode::UNAUTHORIZED, Json(CreateGameResponse::Error))
    }

    let auths: HashMap<_, _> = dbg!(payload.user_ids.iter().map(|user_id| (/* todo Uuid::new_v4().to_string()*/user_id.to_string(), user_id.to_string())).collect());
    
    let auth_list = auths.iter().map(|(auth_token, user_id)| UserAccessToken {
        access_token: auth_token.to_string(),
        user_id: user_id.to_string(),
    }).collect();

    let (pass_on_incoming_message, get_incoming_message) = mpsc::channel(100);
    let (send_to_players, get_to_players) = broadcast::channel(100);

    let game_mutex = Arc::new(Mutex::new(GameState::WaitingForPlayers {
        ready_status: payload.user_ids.iter().map(|user_id| (user_id.to_string(), false)).collect()
    }));
    // todo fix
    let game_id = Uuid::new_v4().to_string();
    let game_state = AuthGameState {
        players: auths,
        game: Arc::clone(&game_mutex),
        sender: pass_on_incoming_message,
        to_players: get_to_players
    };
    
    let state_clone = state.clone();
    tokio::spawn(async move {
        game_runner(game_mutex, payload.user_ids, get_incoming_message, send_to_players, state_clone, PowerUpCosts::default()).await;
    });

    {
        let mut writer = state.games.write().await;
        writer.insert(game_id.clone(), game_state);
    }

    (StatusCode::OK, Json(CreateGameResponse::Success {
        game_id,
        users: auth_list,
    }))
}
