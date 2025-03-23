use crate::run_server::run_server;

pub mod games_server;
pub mod management_server;
pub mod run_server;

#[tokio::main]
async fn main() {
    run_server().await
}
