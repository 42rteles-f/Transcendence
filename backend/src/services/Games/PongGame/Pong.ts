import GameSocket from '../GameSocket';
import { EventArray } from '../GameSocket';
import { Socket } from 'socket.io';
import Ball from './PongBall';
import Paddle from './PongPaddle';
import {
	PongPlayer,
	PongState,
	Position,
	GAME_HEIGHT,
	GAME_WIDTH,
	LEFT,
	RIGHT,
	PADDLE_WIDTH,
	PADDLE_HEIGHT,
	BALL_SIZE,
	BALL_SPEED,
	MAX_SCORE,
} from './PongTypes';
//import { localGameLogger, pongGameLogger } from "../../../logger/logger";

class Pong extends GameSocket {
	private	players:		PongPlayer[] = [];
	private ball?:			Ball = undefined;
	private status:			"waiting" | "playing" | "finished" | "error";
	private localPlay:		boolean = false;
	private leaveTimeout?:	NodeJS.Timeout = undefined;
	public	winner?:		PongPlayer = undefined;

	constructor(clients: Socket[], roomName?: string) {
		if (!roomName)
		{
			const timestamp = Date.now();
			const random = Math.random().toString(36).substring(7);
			roomName = `pong-room-${timestamp}-${random}`;
		}

		super(clients, roomName);

		if (clients.length !== 2)
		{
			this.status = 'error';
			//pongGameLogger.error("Pong game requires exactly 2 players.");
			return ;
		}
		
		clients.forEach((client, index) => {
			this.players.push({
				id: client.data.user.id.toString(),
				name: client.data.user.username,
				paddle: new Paddle(
					index === LEFT ? 0 : GAME_WIDTH - PADDLE_WIDTH,
					GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2
				),
				score: 0,
				online: false
			});
		});
		this.localPlay = (clients[0].id === clients[1].id);

		this.mapEvents();

		this.ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2 - BALL_SIZE / 2);
		this.status = 'waiting';
		this.leaveTimeout = setTimeout(() => {
			if (this.status === 'waiting') {
				this.status = 'error';
				this.destructor();
			}
		}, 10000);
		this.updateState();
		if (this.localPlay) {
			//localGameLogger.log("Localgame started!");
			this.players.forEach((p) => p.online = true);
			this.onPlayerJoin(clients[0]);
		}
	}

	private mapEvents(): void {
		//console.log(`[MAP-EVENTS] Mapping events for room ${this.room}`);
		this.players.forEach((player) => {
			//console.log(`[MAP-EVENTS] Setting up events for player: ${player.name} (${player.id})`);
			if (this.players[0].id === this.players[1].id && player === this.players[1])
				return ;
			const events: EventArray = [];
			
			events.push({
				event: "pong-match-join", 
				callback: (data: any) => {
					const room = data?.room || this.room;  // Use this.room as fallback
					this.onPongMatchJoin(player, room);
				}
			});
			
			events.push({
				event: "pong-match-leave", 
				callback: (data: any) => {
					const room = data?.room || this.room;  // Use this.room as fallback
					this.onPongMatchLeave(player, room);
				}
			});
			
			events.push({
				event: "player-forfeit", 
				callback: (data: any) => {
					const room = data?.room || this.room;  // Use this.room as fallback
					this.playerForfeit(player, room);
				}
			});
			
			events.push({
				event: "paddle-update", 
				callback: (data: any) => {
					// For paddle update, only process if it's for our room
					if (!this.room || !data?.room || data.room === this.room) {
						player.paddle.changeDirection(data?.direction || 0);
					}
				}
			});
			
			if (this.localPlay) {
				events.push({
					event: "second-paddle-update", 
					callback: (data: any) => {
						if (!this.room || !data?.room || data.room === this.room) {
							this.players[1].paddle.changeDirection(data?.direction || 0);
						}
					}
				});
			}
			
			this.addEvents(player.id, events);
		});
	}

	protected onTick(): void {
		this.ball!.update();
		this.players.forEach((player) => {
			player.paddle.update();
			this.ball!.onCollision(player.paddle);
		});

		this.gameCheck();
		this.updateState();
	}

	protected gameCheck(): void {
		const side: number = this.isPoint();
		if (side > -1)
		{
			this.players[side].score += 1;
			this.resetRound();
			if (this.players[side].score >= MAX_SCORE)
			{
				this.stopGameLoop();
				this.winner = this.players[side];
				this.status = 'finished';
				
				if (this.room && this.room.startsWith('tournament-'))									// Don't call destructor
				{
					console.log(`[TOURNAMENT-GAME] Game finished, winner: ${this.winner.name}`);
					this.broadcast("tournament-game-over", { winner: this.winner, room: this.room });
				}
				else
					this.broadcast("pong-game-over", { winner: this.winner });							// For regular games, emit normal game-over
			}
		}
		if (this.leaveTimeout && (this.players.every((p) => p.online) || this.winner))
			this.endTimeout();
	}

	private isPoint(): number {
		const ballPosition: Position = this.ball!.position();
		if (ballPosition.x <= 0)
			return (RIGHT);
		else if (ballPosition.x >= GAME_WIDTH)
			return (LEFT);
		return (-1);
	}

	private updateState(): void {
		(this.state as PongState) = {
			playersState: this.players.map((player) => ({
				id: player.id,
				name: player.name,
				paddle: player.paddle.position(),
				paddleDimensions: {
					width: PADDLE_WIDTH,
					height: PADDLE_HEIGHT
				},
				score: player.score,
				online: player.online
			})),
			ball: this.ball!.position(),
			ballSize: BALL_SIZE,
			gameStatus: this.status
		};
	}

	public	getState(): PongState {
		return (this.state);
	}

	private	resetRound(): void {
		this.ball!.reset({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, BALL_SPEED);
		this.players.forEach((player, index) => {
			player.paddle.reset({
				x: index === LEFT ? 0 : GAME_WIDTH - PADDLE_WIDTH,
				y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2
			});
		});
	}

	private onPongMatchJoin(player: PongPlayer, room: string): void {
		//console.log(`[PONG-JOIN] Player ${player.name} trying to join. Expected room: ${this.room}, Got room: ${room}`);

		if (room != this.room || !player)
		{
			//console.log(`[PONG-JOIN] Rejected - wrong room or no player`);
			return;
		}

		//console.log(`[PONG-JOIN] Accepted - player ${player.name} joined room ${room}`);
		//pongGameLogger.log(`room ${room} - player ${player.name} joined the match`);
		if (this.localPlay)
			this.players.forEach((p) => p.online = true);
		else
			player.online = true;
		super.onPlayerJoin(player as unknown as Socket);
		const allClientsReady = this.players.every((p) => p.online);
		console.log("All clients ready: ", allClientsReady, " Status: ", this.status);
		//pongGameLogger.log("All clients ready");
		if (allClientsReady) {
			this.status = 'playing';
			//pongGameLogger.log("Starting game loop");
			this.endTimeout();
			this.startGameLoop();
		}
	}

	private onPongMatchLeave(player: PongPlayer, room: string): void {
		if (room != this.room || !player) return ;
		
		if (this.localPlay)
			this.players.forEach((p) => p.online = false);
		else
			player.online = false;
		super.onPlayerLeave(player as unknown as Socket);
		if (this.players.every((p) => !p.online)) {
			this.winByDisconnect(player);
		}
		else {
			if (this.leaveTimeout) { clearTimeout(this.leaveTimeout); }
			this.leaveTimeout = setTimeout(() => {
				//pongGameLogger.log("A player did not return in time, ending the game.");
				console.log("Status: ", this.status, " Players online: ", this.players.some((p) => !p.online));
				if (this.status === 'playing' && this.players.some((p) => !p.online))
					this.winByDisconnect();
				this.leaveTimeout = undefined;
			}, 10000);
		}
	}

	public onPlayerJoin(socket: Socket): void {
		super.onPlayerJoin(socket);
		const player = this.players.find((p) => p.id === socket.data.user.id.toString());
		if (player) {
			this.onPongMatchJoin(player, this.room!);
		}
	}

	private playerForfeit(player: PongPlayer, room: string): void {
		if (room != this.room || !player) return ;

		player.online = false;
		this.winByDisconnect();
	}

	private winByDisconnect(winner?: PongPlayer): void {
		this.stopGameLoop();
		this.status = 'finished';``
		if (!this.winner) this.winner = winner ?? this.players.find((p) => p.online)!;
		this.broadcast("pong-game-over", { winner: this.winner });
		this.endTimeout();
		this.destructor();
	}

	private endTimeout() {
		if (!this.leaveTimeout) return ;

		clearTimeout(this.leaveTimeout);
		this.leaveTimeout = undefined;
	}

	public destructor(): void {
		console.log(`Destructing Pong game: ${this.status} in room: ${this.room}`);
		
		// Only assign random winner for non-tournament games that errored out
		if (!this.winner && this.status === 'error' && !this.room?.startsWith('tournament-')) {
			this.winner = this.players[Math.floor(Math.random() * this.players.length)];
		}
		
		this.updateState();
		this.stopGameLoop();
		super.destructor();
	}
}

export default Pong;
