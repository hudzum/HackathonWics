use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum ManagementIncomingMessage {
    CreateGame {api_token: String, users: Vec<String>}
}
