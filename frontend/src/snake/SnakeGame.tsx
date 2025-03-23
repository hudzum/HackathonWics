import React, {useEffect, useMemo, useRef, useState} from "react";
import {
	AmountSpent,
	ClientMessage,
	PowerUps,
	ReadyStatus,
	RecentPowerUp,
	ServerMessage
} from "@/snake/ServerMessage.ts";

export interface SnakeGameProps {
	user_id: string,
	// user id to display name
	all_users: { [key: string]: string },
	access_token: string,
	game_id: string,
	url: string
}

const SNAKE_COLORS = [
	"blue",
	"green",
	"purple",
	"orange",
	"pink",
	"brown",
	"black"];

function getPowerupCost(powerup: PowerUps) {
	if (powerup.type === 'Revive') {
		return 10;
	} else if (powerup.type === "ShrinkOpponent") {
		return 3;
	} else if (powerup.type === "ExtraLife") {
		return 5;
	} else if (powerup.type === "FreezeOpponent") {
		return 3;
	} else if (powerup.type === "AddLength") {
		return 1;
	} else throw `Cost not specified`
}

export const SnakeGame: React.FC<SnakeGameProps> = props => {
	const ref = useRef<HTMLCanvasElement>(null);
	const orderedKeys = useMemo(() => Object.keys(props.all_users), []);
	const socket = useRef<WebSocket | undefined>(undefined);

	const [readyStates, setReadyStates] = useState<ReadyStatus[] | 'started'>([]);
	const [recentPowerups, setRecentPowerups] = useState<RecentPowerUp[]>([]);

	function send(msg: ClientMessage) {
		socket.current?.send(JSON.stringify(msg));
	}
	
	const [dead, setDead] = useState<{reviveLeft: number, reviveTotal: number} | false>(false);
	
	const [gameOver, setGameOver] = useState<false | {
		winner: string,
		amounts_spent: AmountSpent[]
	}>(false);

	useEffect(() => {
		const ws = new WebSocket(props.url);
		socket.current = ws;

		ws.addEventListener('open', () => {
			send({
				type: "Authenticate",
				game_id: props.game_id,
				access_token: props.access_token
			});
		});

		ws.addEventListener('message', async (event) => {
			const msg = JSON.parse(await event.data.text()) as ServerMessage;

			// console.log(msg);

			if (msg.type === "GameState") {
				const g = ref.current?.getContext("2d");
				if (g) {
					g.clearRect(0, 0, 100, 50);

					g.fillStyle = "red";
					for (const apple of msg.apples) {
						g.fillRect(apple[0], apple[1], 1, 1);
					}

					for (const snake of msg.snakes) {
						if (snake.user_id === props.user_id && snake.type === "Dead") {
							console.log("daed");
							setDead({reviveTotal: 100, reviveLeft: snake.revive_left});
						} else if (snake.user_id === props.user_id) {
							setDead(false);
						}

						if (snake.type === "Alive") {
							if (snake.invulnerable && Date.now() % 300 > 150) continue;

							let head = snake.head;
							g.fillStyle = SNAKE_COLORS[orderedKeys.indexOf(snake.user_id)];
							for (const [direction, len] of snake.blocks) {
								let deltaHead;
								if (direction.type === "Up") deltaHead = [0, 1];
								else if (direction.type === "Down") deltaHead = [0, -1];
								else if (direction.type === "Left") deltaHead = [1, 0];
								else if (direction.type === "Right") deltaHead = [-1, 0];
								else throw new Error("Unknown direction");

								for (let i = 0; i < len; i++) {
									g.fillRect(head[0], head[1], 1, 1);
									head = [head[0] + deltaHead[0], head[1] + deltaHead[1]];
								}
							}

							g.fillStyle = SNAKE_COLORS[orderedKeys.indexOf(snake.user_id)];
							if (snake.has_extra_life) g.fillStyle = "magenta";
							else if (snake.frozen) g.fillStyle = "gray";
							g.fillRect(snake.head[0], snake.head[1], 1, 1);
						}
					}
				}

				if (msg.recent_power_ups.length > 0) {
					setRecentPowerups(recentPowerups => [...recentPowerups, ...msg.recent_power_ups]);
				}
			} else if (msg.type === 'ReadyStatus') {
				setReadyStates(msg.status);
			} else if (msg.type === "StartGame") {
				setReadyStates('started');
			} else if (msg.type === "GameOver") {
				setGameOver(msg);
			}
		})

		document.body.addEventListener('keydown', ev => {
			// console.log(ev.code);

			if (ev.code === 'ArrowUp') {
				send({
					type: "SetDirection",
					direction: { type: "Up" }
				})
			} else if (ev.code === 'ArrowDown') {
				send({
					type: "SetDirection",
					direction: { type: "Down" }
				})
			} else if (ev.code === 'ArrowLeft') {
				send({
					type: "SetDirection",
					direction: { type: "Left" }
				})
			} else if (ev.code === 'ArrowRight') {
				send({
					type: "SetDirection",
					direction: { type: "Right" }
				})
			}
		})

	}, []);

	// console.log(props.all_users);

	function setReady(ready: boolean) {
		if (socket.current) {
			socket.current.send(JSON.stringify({
				type: "SetReady",
				ready
			}));
		}
	}

	function randOpponent() {
		const allButMe = orderedKeys.filter(user => user !== props.user_id);
		return allButMe[Math.floor(Math.random() * allButMe.length)];
	}

	console.log(gameOver);

	return (
		<div style={{width: '100%', height: '100%', position: 'relative', display: 'grid', justifyItems: 'center', alignItems: 'start', gridTemplateRows: '1fr min-content', gridTemplateColumns: '1fr 300px', gridTemplateAreas: '"game recent" "power ."', gap: 10}}>
			{
					readyStates === 'started' ? (
						<>
							{
								gameOver && (
									<div
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											backgroundColor: 'rgba(0, 0, 0, 0.8)',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'center',
											alignItems: 'center',
											color: 'white',
											zIndex: 1000,
										}}
									>
										<h1 style={{fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px'}}>Game Over!</h1>
										<h2 style={{fontSize: '2rem', marginBottom: '20px'}}>Winner: <b>{props.all_users[gameOver.winner]}</b></h2>

										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												gap: '10px',
												padding: '20px',
												border: '1px solid #fff',
												borderRadius: '10px',
												backgroundColor: 'rgba(255, 255, 255, 0.1)',
												width: '80%',
											}}
										>
											<h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>Player Stats:</h3>
											{orderedKeys.map(player => (
												<div
													key={player}
													style={{
														display: 'flex',
														justifyContent: 'space-between',
														width: '100%',
														backgroundColor: 'rgba(255, 255, 255, 0.2)',
														padding: '10px 15px',
														borderRadius: '5px',
													}}
												>
													<span style={{fontWeight: 'bold', fontSize: '1rem'}}>{props.all_users[player]}</span>
													<span>
						{new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
						}).format(gameOver.amounts_spent.find(({user_id}) => user_id === player)?.amount_spent)}
					</span>
												</div>
											))}
										</div>
									</div>
								)
							}

							<canvas width="100" height="50" style={{gridArea: "game", width: '100%', imageRendering: 'pixelated', border: '1px solid black'}} ref={ref}>

							</canvas>

							<div style={{gridArea: "recent", width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}>
								<div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
								<h3 style={{textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Powerups</h3>
									{[...recentPowerups].reverse().map((powerup, index) => (

										<div
											key={index}
											style={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												justifyContent: 'center',
												padding: '10px',
												marginBottom: '10px',
												border: '1px solid #ccc',
												borderRadius: '8px',
												backgroundColor: '#f9f9f9',
												boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
											}}
										>
											<div style={{display: 'flex', justifyContent: 'center', position: 'relative', width: '100%'}}>
												<h4 style={{margin: '5px 0'}}>Powerup: {powerup.power_up.type}</h4>
												<p style={{color: 'orangered', fontSize: 16, fontWeight: 'bold', position: "absolute", top: '50%', right: 0, transform: 'translateY(-50%)'}}>

													{new Intl.NumberFormat('en-US', {
														style: 'currency',
														currency: 'USD'
													}).format(getPowerupCost(powerup.power_up))}
												</p>
											</div>
											{'opponent' in powerup.power_up && (<p style={{margin: '2px 0', fontSize: '14px', color: '#555'}}>
												On: {props.all_users[powerup.power_up.opponent]}
											</p>)}
											<p style={{margin: '2px 0', fontSize: '14px', color: '#555'}}>
												By: {props.all_users[powerup.user_id]}
											</p>
										</div>
										// <div key={index}>Powerup: {powerup.power_up.type} on {powerup.power_up.opponent} by {powerup.user_id}</div>
									))}

								</div>
							</div>

							<div style={{gridArea: "power", background: 'gold', borderRadius: 5, padding: 10, display: 'flex', gap: 10, justifyContent: 'center', width: 'fit-content', justifySelf: 'center'}}>
								<button style={{background: 'white', fontWeight: 'bold', borderRadius: 5, padding: 10}} onClick={() => send({type: "UsePowerUp", power_up: {type: "ExtraLife"}})}>
									Buy extra life
								</button>
								<button style={{background: 'white', fontWeight: 'bold', borderRadius: 5, padding: 10}} onClick={() => send({type: "UsePowerUp", power_up: {type: "AddLength"}})}>
									All 10 Length
								</button>
								<button style={{background: 'white', fontWeight: 'bold', borderRadius: 5, padding: 10}} onClick={() => send({type: "UsePowerUp", power_up: {type: "ShrinkOpponent", opponent: randOpponent()}})}>
									Shrink Random Opponent
								</button>
								<button style={{background: 'white', fontWeight: 'bold', borderRadius: 5, padding: 10}} onClick={() => send({type: "UsePowerUp", power_up: {type: "FreezeOpponent", opponent: randOpponent()}})}>
									Freeze Random Opponent
								</button>
							</div>

							{
								dead && !gameOver && (

									<div
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											backgroundColor: 'rgba(0, 0, 0, 0.7)',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'center',
											alignItems: 'center',
											color: 'white',
											zIndex: 1000,
										}}
									>
										<h1>You have died!</h1>
										<p>Time remaining to revive:</p>
										<div
											style={{
												position: 'relative',
												width: '80%',
												height: '20px',
												backgroundColor: 'gray',
												borderRadius: '10px',
												overflow: 'hidden',
												margin: '10px 0',
											}}
										>
											<div
												style={{
													width: `${(dead.reviveLeft / dead.reviveTotal * 100).toFixed(0)}%`,
													height: '100%',
													backgroundColor: 'red',
													transition: 'width 1s linear',
												}}
											/>
										</div>
										<button
											onClick={() => send({
												type: 'UsePowerUp',
												power_up: {
													type: "Revive"
												}
											})}
											style={{
												backgroundColor: 'white',
												color: 'black',
												fontWeight: 'bold',
												padding: '10px 20px',
												borderRadius: '5px',
												border: 'none',
												cursor: 'pointer',
												marginTop: '10px',
												opacity: dead.reviveLeft <= 0 ? 0.5 : 1,
											}}
											disabled={dead.reviveLeft <= 0}
										>
											Revive
										</button>
									</div>
								)
							}
						</>
					) : (
						<>

							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									height: '100%',
									textAlign: 'center',
									background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
									borderRadius: '10px',
									padding: '20px',
									boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
								}}
							>
								<h1
									style={{
										fontSize: '2rem',
										fontWeight: 'bold',
										marginBottom: '20px',
										color: '#333'
									}}
								>
									Waiting for Players
								</h1>
								<p
									style={{
										fontSize: '1.2rem',
										marginBottom: '30px',
										color: '#555'
									}}
								>
									Please wait until all players are ready...
								</p>
								<button
									onClick={() =>
										setReady(!readyStates.find(({user_id}) => user_id === props.user_id)?.ready)
									}
									style={{
										backgroundColor: readyStates.find(({user_id}) => user_id === props.user_id)?.ready
											? '#4caf50'
											: '#f44336',
										color: 'white',
										fontWeight: 'bold',
										padding: '15px 30px',
										borderRadius: '8px',
										border: 'none',
										cursor: 'pointer',
										transition: 'background 0.3s',
										fontSize: '1.1rem'
									}}
								>
									{readyStates.find(({user_id}) => user_id === props.user_id)?.ready
										? 'I am ready!'
										: 'Click to Ready Up'}
								</button>
								<div
									style={{
										marginTop: '40px',
										display: 'flex',
										flexDirection: 'column',
										gap: '10px',
										alignItems: 'center',
										width: '100%'
									}}
								>
									{readyStates.map(({user_id, ready}) => (
										<div
											key={user_id}
											style={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												width: '60%',
												background: '#fff',
												padding: '10px 20px',
												borderRadius: '8px',
												boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
											}}
										>
		<span
			style={{
				fontWeight: 'bold',
				color: '#333'
			}}
		>
		  {props.all_users[user_id]}
		</span>
											<span
												style={{
													color: ready ? '#4caf50' : '#f44336',
													fontWeight: 'bold'
												}}
											>
		  {ready ? 'Ready' : 'Not Ready'}
		</span>
										</div>
									))}
								</div>
							</div>
						</>
					)

			}
		</div>
	);
}
