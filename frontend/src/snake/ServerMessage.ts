export type Direction = { type: "Up" | "Down" | "Left" | "Right" };

export type PowerUps = {
	type: "ExtraLife"
} | {
	type: "AddLength"
} | {
	type: "ShrinkOpponent",
	opponent: string
} | {
	type: "FreezeOpponent",
	opponent: string
} | {
	type: "Revive"
}

export type SentSnake = {
	type: "Alive",
	user_id: string,
	head: [number, number],
	head_direction: Direction,
	blocks: [Direction, number][],
	invulnerable: boolean,
	frozen: boolean,
	has_extra_life: boolean
} | {
	type: "Dead",
	user_id: string,
	revive_left: number
}

export type ReadyStatus = {
	user_id: string,
	ready: boolean
}

export type AmountSpent = {
	user_id: string,
	amount_spent: number
}

export type RecentPowerUp = {
	user_id: string,
	power_up: PowerUps
}

export type ServerMessage  ={
	type: "Authenticated"
} | {
	type: "ReadyStatus",
	status: ReadyStatus[]
} | {
	type: "StartGame"
} | {
	type: "GameOver",
	winner: string,
	amounts_spent: AmountSpent[]
} | {
	type: "GameState",
	apples: [number, number][],
	snakes: SentSnake[],
	just_ate_apple: string[],
	recent_power_ups: RecentPowerUp[]
}


export type ClientMessage = {
	type: "Authenticate",
	access_token: string,
	game_id: string
} | {
	type: "UsePowerUp",
	power_up: PowerUps
} | {
	type: "SetDirection",
	direction: Direction
} | {
	type: "SetReady",
	ready: boolean
};