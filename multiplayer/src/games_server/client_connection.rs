use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;
use axum::extract::{State, WebSocketUpgrade};
use axum::extract::ws::{Message, WebSocket};
use axum::response::IntoResponse;
use tokio::sync::{broadcast, mpsc};
use bytes::Bytes;
use futures::stream::SplitStream;
use crate::games_server::all_games_state::{AllGamesState, GameIncomingMessage};
use crate::games_server::client_message::ClientMessage;
use crate::games_server::server_message::ServerMessage;

pub async fn handle_client_connection(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AllGamesState>>
) -> impl IntoResponse {
    println!("auth");
    ws.on_upgrade(move |socket| handle_websocket_auth(socket, state))
}

async fn handle_websocket_auth(
    mut socket: WebSocket,
    state: Arc<AllGamesState>
) {
    if let Some(Ok(msg)) = socket.recv().await {
                println!("0");
        if let Ok(msg) = serde_json::from_slice::<ClientMessage>(&*msg.into_data()) {
            if let ClientMessage::Authenticate {access_token, game_id} = msg {
                println!("a");
                let games = state.games.read().await;
                println!("b");
                if let Some(game) = games.get(&game_id) {
                println!("c");
                    if let Some(player_id) = game.players.get(&access_token) {
                println!("d");
                        let player_id = player_id.clone();
                        let (mut sender, receiver) = socket.split();

                        let mut get_messages = game.to_players.resubscribe();
                        
                        let player_id_2 = player_id.clone();
                        tokio::spawn(async move {
                            while let Ok(msg) = get_messages.recv().await {
                                if msg.to_player == player_id {
                                    sender.send(Message::Binary(serde_json::to_vec(&msg.message).unwrap().into())).await.unwrap();
                                }
                            }
                        });
                        
                        websocket_ready_handler(receiver, game.sender.clone(), player_id_2).await;
                    }
                }
            }
        }
    }
}

async fn websocket_ready_handler(
    mut socket: SplitStream<WebSocket>,
    sender: mpsc::Sender<GameIncomingMessage>,
    player_id: String
) {
    while let Some(Ok(msg)) = socket.next().await {
        let msg = serde_json::from_slice::<ClientMessage>(&*msg.into_data());
        if let Ok(msg) = msg {
            sender.send(GameIncomingMessage {
                player_id: player_id.to_string(),
                message: msg,
            }).await.unwrap();
        }
    }
}
