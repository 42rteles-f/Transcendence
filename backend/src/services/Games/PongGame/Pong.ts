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

class Pong extends GameSocket {
	private	players:		PongPlayer[] = [];
	private ball?:			Ball = undefined;
	private status:			"waiting" | "playing" | "finished" | "error";
	private localPlay:		boolean = false;
	private leaveTimeout?:	NodeJS.Timeout = undefined;
	public	winner?:		PongPlayer = undefined;

	constructor(clients: Socket[], roomName?: string) {
		super(clients, roomName ?? "noRoom");
		if (clients.length !== 2) {
			this.status = 'error';
			console.error("Pong game requires exactly 2 players.");
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
		if (this.localPlay)
			this.onPongMatchJoin(this.players[0], this.room!);
	}

	private mapEvents(): void {
		this.players.forEach((player) => {
			const events: EventArray = [];
			events.push({event: "pong-match-join", callback: (room: string) => this.onPongMatchJoin(player, room)});
			events.push({event: "pong-match-leave", callback: (room: string) => this.onPongMatchLeave(player, room)});
			events.push({event: "player-forfeit", callback: (room: string) => this.playerForfeit(player, room)});
			events.push({event: "paddle-update", callback: (direction: number) => player.paddle.changeDirection(direction)});
			if (this.localPlay)
				events.push({event: "second-paddle-update", callback: (direction: number) => player.paddle.changeDirection(direction)});
			this.addEvents(player.id, events);
		});
	}

	protected onTick(): void {
		if (this.players.some((player) => !player.online)) {
			return ;
		}
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
		if (side > -1) {
			this.players[side].score += 1;
			this.resetRound();
			if (this.players[side].score >= MAX_SCORE) {
				this.stopGameLoop();
				this.winner = this.players[side];
				this.status = 'finished';
			}
		}
		if (this.leaveTimeout
			&& (this.players.every((p) => p.online) || this.winner)
		) {
			this.endTimeout();
		}
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
				score: player.score
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
		// if (room != this.room || !player) return ;

		player.online = true;
		const allClientsReady = this.players.every((p) => p.online) ?? this.localPlay;
		console.log("All clients ready: ", allClientsReady, " Status: ", this.status);
		if (allClientsReady) {
			this.status = 'playing';
			console.log("Starting game loop");
			this.endTimeout();
			this.startGameLoop();
		}
	}

	private onPongMatchLeave(player: PongPlayer, room: string): void {
		// if (room != this.room || !player) return ;
		
		player.online = false;
		super.onPlayerLeave(player as unknown as Socket);
		if (this.players.every((p) => !p.online)) {
			this.winByDisconnect(player);
		}
		else
		{
			this.leaveTimeout = setTimeout(() => {
				console.log("A player did not return in time, ending the game.");
				console.log("Status: ", this.status, " Players online: ", this.players.some((p) => !p.online));
				if (this.status === 'playing' && this.players.some((p) => !p.online)) {
					this.winByDisconnect();
				}
			}, 10000);
		}
	}

	private playerForfeit(player: PongPlayer, room: string): void {
		// if (room != this.room || !player) return ;

		player.online = false;
		this.winByDisconnect();
	}

	private winByDisconnect(winner?: PongPlayer): void {
		this.stopGameLoop();
		this.status = 'finished';
		if (!this.winner) this.winner = winner ?? this.players.find((p) => p.online)!;
		this.endTimeout();
		this.destructor();
	}

	private endTimeout() {
		if (!this.leaveTimeout) return ;

		clearTimeout(this.leaveTimeout);
		this.leaveTimeout = undefined;
	}

	public destructor(): void {
		this.stopGameLoop();
		super.destructor();
	}
}

export default Pong;
