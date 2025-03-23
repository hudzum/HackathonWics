use serde::Deserialize;
use crate::games_server::power_ups::{GetPowerUpCost, PowerUps};

#[derive(Deserialize, Debug)]
pub struct PowerUpCosts {
    extra_life: f64,
    all_length: f64,
    revive: f64,
    shrink_opponent: f64,
    freeze_opponent: f64
}

impl Default for PowerUpCosts {
    fn default() -> Self {
        Self {
            extra_life: 5.0,
            all_length: 1.0,
            revive: 10.0,
            shrink_opponent: 3.0,
            freeze_opponent: 5.0
        }
    }
}

impl GetPowerUpCost for PowerUpCosts {
    fn get_cost(&self, power_up: &PowerUps) -> f64 {
        match power_up {
            PowerUps::ExtraLife => self.extra_life,
            PowerUps::AddLength => self.all_length,
            PowerUps::ShrinkOpponent {..} => self.shrink_opponent,
            PowerUps::FreezeOpponent {..} => self.freeze_opponent,
            PowerUps::Revive => self.revive,
        }
    }
}
