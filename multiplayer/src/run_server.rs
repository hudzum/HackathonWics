use std::sync::Arc;
use axum::http::Method;
use axum::Router;
use axum::routing::{get, post};
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};
use crate::games_server::all_games_state::AllGamesState;
use crate::games_server::client_connection::handle_client_connection;
use crate::management_server::create_game::create_game;

pub async fn run_server() {
    let state = Arc::new(AllGamesState {
        games: RwLock::new(std::collections::HashMap::new())
    });

    let app = Router::new()
        .route("/game", get(handle_client_connection))
        .route("/create_game", post(create_game))
        .with_state(state)
        .layer(CorsLayer::new().allow_methods(Any).allow_origin(Any).allow_headers(Any));

    let listener = tokio::net::TcpListener::bind("167.96.127.87:3001").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
