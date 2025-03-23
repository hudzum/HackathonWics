use std::ptr::read;
use std::sync::mpsc::{Receiver, Sender};
use std::sync::{Arc, Mutex, MutexGuard};
use std::task::ready;
use std::time::Duration;
use tokio::sync::{broadcast, mpsc};
use tokio::time;
use crate::games_server::all_games_state::{AllGamesState, GameIncomingMessage, GameOutgoingMessage};
use crate::games_server::all_games_state::game_state::{AliveSnake, Direction, GameState, Snake};
use crate::games_server::client_message::ClientMessage;
use crate::games_server::overlap_detector::detect_overlap;
use crate::games_server::power_up_cost_loader::PowerUpCosts;
use crate::games_server::power_ups::{GetPowerUpCost, PowerUps};
use crate::games_server::server_message::{AmountSpent, ReadyStatus, RecentPowerUp, ServerMessage};

const TICK_TIME_MS: u64 = 100;

const BOARD_SIZE: (u32, u32) = (100, 50);
const NUM_APPLES: u32 = 40;
const MOVE_EVERY_TICKS: u32 = 1;

pub async fn game_runner(
    game: Arc<Mutex<GameState>>,
    all_players: Vec<String>,
    mut get_from_players: mpsc::Receiver<GameIncomingMessage>,
    mut send_to_players: broadcast::Sender<GameOutgoingMessage>,
    state: Arc<AllGamesState>,
    power_up_costs: PowerUpCosts
) {
    let mut interval = time::interval(Duration::from_millis(TICK_TIME_MS));

    let mut tick_count = 0;
    
    loop {
        interval.tick().await;

        let mut player_messages = vec!();

        while !get_from_players.is_empty() {
            let message = get_from_players.recv().await.unwrap();
            player_messages.push(message);
        }

        let mut game = game.lock().unwrap();

        let mut send_to_all = vec!();
        
        let mut start_game = false;
        let mut winner = None;
        
        match &mut *game {
            GameState::WaitingForPlayers { ready_status } => {
                for message in player_messages {
                    if let ClientMessage::SetReady { ready } = message.message {
                        ready_status.insert(message.player_id, ready);
                    }
                }
                
                send_to_all.push(ServerMessage::ReadyStatus{status:
                        ready_status.iter().map(|(player_id, ready)| ReadyStatus {
                            user_id: player_id.to_string(),
                            ready: *ready,
                        }).collect()}
                );

                if ready_status.values().all(|val| *val) {
                    start_game = true;
                }
            },
            GameState::Playing { apples, snakes, amounts_spent } => {
                let mut power_ups_used = vec!();
                for message in player_messages {
                    match message.message {
                        ClientMessage::Authenticate { .. } => {},
                        ClientMessage::UsePowerUp { power_up, .. } => {
                            let should_charge: bool = match &power_up {
                                PowerUps::ExtraLife => {
                                    if let Snake::Alive(snake) = snakes.get_mut(&message.player_id).unwrap() {
                                        snake.has_extra_life = true;
                                        true
                                    } else {
                                        false
                                    }
                                }
                                PowerUps::AddLength => {
                                    if let Snake::Alive(snake) = snakes.get_mut(&message.player_id).unwrap() {
                                        let blocks_len = snake.blocks.len();
                                        snake.blocks[blocks_len - 1].1 += 10;
                                        true
                                    } else { false }
                                }
                                PowerUps::FreezeOpponent {opponent} => {
                                    if let Snake::Alive(opponent) = snakes.get_mut(opponent).unwrap() {
                                        opponent.frozen_for = Some(3 * 1000 / TICK_TIME_MS);
                                        true
                                    } else { false }
                                }
                                PowerUps::ShrinkOpponent {opponent} => {
                                    if let Snake::Alive(opponent) = snakes.get_mut(dbg!(opponent)).unwrap() {
                                        let mut amt_to_shrink = 10;
                                        while amt_to_shrink > 0 && opponent.blocks.len() > 1 {
                                            let block_len = opponent.blocks.len();
                                            if opponent.blocks[block_len - 1].1 < amt_to_shrink {
                                                amt_to_shrink -= opponent.blocks[block_len - 1].1;
                                                opponent.blocks.pop();
                                            } else {
                                                opponent.blocks[block_len - 1].1 -= amt_to_shrink;
                                                amt_to_shrink = 0;
                                            }
                                        }
                                        if amt_to_shrink > 0 && opponent.blocks.len() == 1 {
                                            opponent.blocks[0].1 = std::cmp::max(3, (opponent.blocks[0].1 as i32 - amt_to_shrink as i32)) as u32;
                                        }
                                        true
                                    } else {
                                        false
                                    }
                                }
                                PowerUps::Revive => {
                                    if let Snake::Dead { head, .. } = snakes.get(&message.player_id).unwrap() {
                                        snakes.insert(message.player_id.to_string(), Snake::Alive(AliveSnake {
                                            user_id: message.player_id.to_string(),
                                            head: (BOARD_SIZE.0 / 2, BOARD_SIZE.1 / 2),
                                            head_direction: Direction::Up,
                                            blocks: vec![(Direction::Down, 3)],
                                            invulnerable_for: Some(3 * 1000 / TICK_TIME_MS),
                                            frozen_for: None,
                                            has_extra_life: false,
                                        }));
                                        true
                                    } else {
                                        false
                                    }
                                }
                            };
                            if should_charge {
                                amounts_spent.insert(message.player_id.to_string(), amounts_spent.get(&message.player_id).unwrap_or(&0.0) + power_up_costs.get_cost(&power_up));
                                power_ups_used.push(RecentPowerUp {
                                    user_id: message.player_id.to_string(),
                                    power_up,
                                });
                            }
                        }
                        ClientMessage::SetDirection { direction } => {
                            if let Snake::Alive(snake) = snakes.get_mut(&message.player_id).unwrap() {
                                if snake.head_direction != direction && snake.head_direction.opposite() != direction {
                                    snake.head_direction = direction;
                                }
                            }
                        }
                        ClientMessage::SetReady { .. } => {}
                    }
                }
                
                // add apples
                while (apples.len() as u32) < NUM_APPLES {
                    for _ in 0..5 {
                        let random_coords = (
                            rand::random::<u32>() % BOARD_SIZE.0,
                            rand::random::<u32>() % BOARD_SIZE.1
                        );

                        let mut overlap = false;
                        
                        for snake in snakes.values() {
                            if let Snake::Alive(snake) = snake {
                                if detect_overlap(&random_coords, snake) {
                                    overlap = true;
                                    break;
                                }
                            }
                        }
                        
                        if !overlap {
                            apples.push(random_coords);
                            break;
                        }
                    }
                }
                
                // detect death
                let mut dead = vec!();
                for (user_id, snake) in snakes.iter() {
                    if let Snake::Alive(snake) = snake {
                        if snake.invulnerable_for.is_none() && snake.frozen_for.is_none() {
                            for (other_id, snake_id) in snakes.iter() {
                                if other_id == user_id {
                                    continue;
                                } else if let Snake::Alive(other_snake) = snake_id {
                                    if detect_overlap(&snake.head, &other_snake) {
                                        dead.push(user_id.to_string());
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                for dead_snake in dead {
                    let snake = snakes.get_mut(&dead_snake).unwrap();
                    if let Snake::Alive(alive_snake) = snake {
                        if alive_snake.has_extra_life {
                            alive_snake.has_extra_life = false;
                            alive_snake.invulnerable_for = Some(3 * 1000 / TICK_TIME_MS);
                        } else {
                            *snake = Snake::Dead {
                                user_id: alive_snake.user_id.to_string(),
                                head: alive_snake.head,
                                ticks_to_revive: Some(100),
                            }
                        }
                    }
                }
                
                // detect apples being eaten
                apples.retain(|apple| {
                    for (_, snake) in snakes.iter_mut() {
                        if let Snake::Alive(snake) = snake {
                            if snake.head == *apple {
                                let blocks_len = snake.blocks.len();
                                snake.blocks[blocks_len - 1].1 += 2;
                                return false;
                            }
                        }
                    }
                    true
                });

                // toggle invulnerability
                for (_, snake) in snakes.iter_mut() {
                    if let Snake::Alive(snake) = snake {
                        if let Some(invulnerable_for) = snake.invulnerable_for {
                            if invulnerable_for > 0 {
                                snake.invulnerable_for = Some(invulnerable_for - 1);
                            } else {
                                snake.invulnerable_for = None;
                            }
                        }
                        if let Some(frozen_for) = snake.frozen_for {
                            if frozen_for > 0 {
                                snake.frozen_for = Some(frozen_for - 1);
                            } else {
                                snake.frozen_for = None;
                            }
                        }
                    } else if let Snake::Dead {ticks_to_revive, user_id, .. } = snake {
                        if let Some(remaining) = ticks_to_revive {
                            if *remaining == 0 {
                                *ticks_to_revive = None;

                            } else {
                                *remaining -= 1;
                            }
                        }
                    }
                }

                let alive: Vec<_> = snakes.iter().filter(|(_, snake)| {
                    if let Snake::Dead { ticks_to_revive, .. } = snake {
                        ticks_to_revive.is_some()
                    } else {
                        true
                    }
                }).collect();
                if alive.len() == 1 {
                    winner = Some(alive[0].0.to_string());
                } else if alive.len() == 0 {
                    winner = Some(snakes.iter().next().unwrap().0.to_string());
                }

                // move snake forward
                if tick_count % MOVE_EVERY_TICKS == 0 {
                    for (_, snake) in snakes.iter_mut() {
                        if let Snake::Alive(snake) = snake {
                            if snake.frozen_for.is_some() {
                                continue;
                            }

                            let head_delta: (i32, i32) = match snake.head_direction {
                                Direction::Up => (0, -1),
                                Direction::Down => (0, 1),
                                Direction::Left => (-1, 0),
                                Direction::Right => (1, 0),
                            };
                            snake.head = ((snake.head.0 as i32 + head_delta.0 + BOARD_SIZE.0 as i32) as u32 % BOARD_SIZE.0, (snake.head.1 as i32 + head_delta.1 + BOARD_SIZE.1 as i32) as u32 % BOARD_SIZE.1);

                            if snake.head_direction != snake.blocks[0].0 {
                                snake.blocks.insert(0, (snake.head_direction.clone(), 0));
                            }
                            snake.blocks[0].1 += 1;
                            let blocks_len = snake.blocks.len();
                            snake.blocks[blocks_len - 1].1 -= 1;
                            if snake.blocks[blocks_len - 1].1 == 0 {
                                snake.blocks.pop();
                            }
                        }
                    }
                }
                
                send_to_all.push(
                    ServerMessage::GameState {
                        snakes: snakes.values().map(|snake| snake.into()).collect(),
                        apples: apples.clone(),
                        just_ate_apple: vec!(),
                        recent_power_ups: power_ups_used,
                    }
                )
            },
            GameState::GameOver { amounts_spent, winner } => {
                send_to_all.push(
                    ServerMessage::GameOver {
                        winner: winner.to_string(),
                        amounts_spent: amounts_spent.iter().map(|(user_id, amount)| AmountSpent {
                            user_id: user_id.to_string(),
                            amount_spent: *amount,
                        }).collect()
                    }
                )
            }
        }
        
        if start_game {
            let num_players = all_players.len();
            *game = GameState::Playing {
                apples: vec!(),
                snakes: all_players.iter().enumerate().map(|(idx, key)| (key.to_string(), Snake::Alive(AliveSnake {
                    user_id: key.to_string(),
                    head: (BOARD_SIZE.0 * idx as u32 / num_players as u32 + BOARD_SIZE.0 / (2 * num_players as u32), BOARD_SIZE.1 / 2),
                    head_direction: Direction::Up,
                    blocks: vec![(Direction::Up, 3)],
                    invulnerable_for: None,
                    frozen_for: None,
                    has_extra_life: false,
                }))).collect(),
                amounts_spent: all_players.iter().map(|key| (key.to_string(), 0.0)).collect(),
            };

            send_to_all.push(ServerMessage::StartGame);
        }

        if let Some(winner) = winner {
            *game = GameState::GameOver {
                winner,
                amounts_spent: match &*game {
                    GameState::Playing { amounts_spent, .. } => amounts_spent.iter().map(|(user_id, amount)| (user_id.to_string(), *amount)).collect(),
                    _ => panic!("Game over but not playing"),
                }
            }
        }
        
        for message in send_to_all {
            for player in &all_players {
                let result = send_to_players.send(GameOutgoingMessage {
                    to_player: player.to_string(),
                    message: message.clone(),
                });
                if let Err(err) = result {
                    eprintln!("Error sending message to player: {}", err);
                }
            }
        }

        tick_count += 1;
    }
}
