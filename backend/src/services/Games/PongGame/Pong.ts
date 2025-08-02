import GameSocket from '../GameSocket';
import { Socket } from 'socket.io';
import { Pointer } from "../../../socket/SocketManager"
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
	private	players:	PongPlayer[] = [];
	private ball:		Pointer<Ball> = null;
	private status: 	"waiting" | "playing" | "finished" | "error";
	public	winner:		Pointer<PongPlayer> = null;

	constructor(clients: Socket[]) {
		super(clients);
		if (clients.length !== 2) {
			this.status = 'error';
			console.error("Pong game requires exactly 2 players.");
			return ;
		}
		clients.forEach((client, index) => {
			this.players.push({
				id: client.id,
				name: client.data.user.username,
				paddle: new Paddle(
					index === LEFT ? 0 : GAME_WIDTH - PADDLE_WIDTH,
					GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2
				),
				score: 0,
				online: false
			});
			const localPlay = (clients[0].id === clients[1].id && index === RIGHT) ? "second-" : "";
			this.addEventHook(clients[index], localPlay + `paddle-update`, ({ direction }: { direction: number }) => {
				this.players[index].paddle.changeDirection(direction);
			});
		});

		this.ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2 - BALL_SIZE / 2);
		this.status = 'playing';
		this.updateState();
		// if (!this.players.some(player => !player.online))
		this.startGameLoop();
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
		if (side > -1) {
			this.players[side].score += 1;
			this.resetRound();
			if (this.players[side].score >= MAX_SCORE) {
				this.stopGameLoop();
				this.winner = this.players[side];
				this.status = 'finished';
			}
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

	public destructor(): void {
		console.log(`Pong game ended. Winner: ${this.winner ? this.winner.name : 'None'}`);
		this.stopGameLoop();
		this.removeEventHook(`paddle-update`);
		this.removeEventHook(`second-paddle-update`);
		super.destructor();
	}
}

export default Pong;

	// protected onInit(): void {
	// 	this.state = { players: {}, ball: { x: 0, y: 0 } };
	// 	this.setState({
	// 		score: [],
	// 		ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
	// 		paddleLeft: { x: 0, y: GAME_HEIGHT / 2 },
	// 		paddleRight: { x: GAME_WIDTH - PADDLE_WIDTH, y: GAME_HEIGHT / 2 }
	// 	});

	// 	this.ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1, 0);

	// 	this.players.forEach((player, index) => {
	// 		player.paddle = new Paddle(index === LEFT ? 0 : GAME_WIDTH - PADDLE_WIDTH, GAME_HEIGHT / 2);
	// 		this.addEventHook(player, `paddle-update`, (direction: number) => {
	// 			player.paddle.changeDirection(direction);
	// 		});
	// 	});

	// 	this.startGameLoop();
	// }