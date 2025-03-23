use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[derive(Clone)]
#[serde(tag="type")]
pub enum PowerUps {
    ExtraLife,
    AddLength,
    ShrinkOpponent {opponent: String},
    FreezeOpponent {opponent: String},
    Revive
}

pub trait GetPowerUpCost {
    fn get_cost(&self, power_up: &PowerUps) -> f64;
}