use crate::games_server::all_games_state::game_state::{AliveSnake, Direction};

pub fn detect_overlap(
    point: &(u32, u32),
    snake: &AliveSnake
) -> bool {
    let mut head = snake.head;
    for (dir, block_len) in &snake.blocks {
        for _ in 0..*block_len {
            if head == *point {
                return true;
            }

            let delta_head: (i32, i32) = match dir {
                Direction::Up => (0, 1),
                Direction::Down => (0, -1),
                Direction::Left => (1, 0),
                Direction::Right => (-1, 0),
            };
            head = ((head.0 as i32 + delta_head.0) as u32, (head.1 as i32 + delta_head.1) as u32);
        }
    }
    false
}
