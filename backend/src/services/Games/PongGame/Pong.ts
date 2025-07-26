import GameSocket from '../GameSocket';
import { PongScore } from '../GameSocket';
import SocketManager from '../../../socket/SocketManager';
import { Socket } from 'socket.io';
import { Pointer } from "../../../socket/SocketManager"

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5;
const BALL_SPEED = 3;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const LEFT = 0;
const RIGHT = 1;
const MAX_SCORE = 11;

interface Position {
	x:	number;
	y:	number;
}

interface Paddle {
	width:	number;
	height:	number;
	yPos:	number;
}

interface PongPlayer {
	id:		string;
	name:	string;
	paddle:	Paddle;
	score:	number;
}

interface PongPlayerState {
	id:		string;
	name:	string;
	paddle:	Position;
	score:	number;
}

interface Collidable {
	x:		number;
	y:		number;
	width:	number;
	height:	number;

	onCollision(target: Collidable): Boolean;
}

interface PongLimits {
	left:	number;
	right:	number;
	top:	number;
	bottom:	number;
}

interface PongState {
	playersState:	PongPlayerState[];
	ball:			Position;
}

class Paddle implements Collidable {
	public	width = PADDLE_WIDTH;
	public 	height = PADDLE_HEIGHT;
	public 	x: number;
	public 	y: number;
	private	direction: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.direction = 0;
	}

	public onCollision(target: Collidable): Boolean {
		return (false);
	}

	public changeDirection(direction: number) {
		if (direction < -1 || direction > 1)
			direction = 0;
		this.direction = direction;
	}

	public update(): void {
		this.y += this.direction * PADDLE_SPEED;
	}

	public position(): Position {
		return ({x: this.x, y: this.y});
	}
}

class Ball implements Collidable {
	public x: number;
	public y: number;
	public width = BALL_SIZE;
	public height = BALL_SIZE;
	private vx: number;
	private vy: number;
	public speed: number = BALL_SPEED;

	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
	}

	public onCollision(target: Collidable): boolean {
		if (this.x + this.width >= target.x &&
			this.x < target.x + target.width &&
			this.y + this.height > target.y &&
			this.y < target.y + target.height)
		{
			const targetCenter = target.y + target.height / 2;
			const ballCenter = this.y + this.height / 2;
			const angle = (ballCenter - targetCenter) / (target.height / 2);
			this.vy = angle * this.speed;
			this.vx = -this.vx;
			this.x = target.x + target.width;
			return (true);
		}
		return (false);
	}

	public reset(): void {
		this.x = GAME_WIDTH / 2;
		this.y = GAME_HEIGHT / 2;
		this.vx = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
		this.vy = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
	}

	public update(): void {
		this.x += this.vx;
		this.y += this.vy;
	}

	public nextPosition(): Position {
		return ({
			x: this.x + this.vx,
			y: this.y + this.vy
		});
	}

	public position(): Position {
		return { x: this.x, y: this.y };
	}

	public reverseX(): void {
		this.vx = -this.vx;
	}

	private wallCollision(): boolean {
		if (this.y < 0 || this.y + BALL_SIZE > GAME_HEIGHT) {
			this.vy = -this.vy;
			return true;
		}
		return false;
	}

	public isPoint(): Number {
		if (this.x < 0)
			return (1);
		else if (this.x > GAME_WIDTH)
			return (2);
		return (0);
	}
}

class Pong extends GameSocket {
	private	players:	PongPlayer[] = [];
	private ball:		Pointer<Ball> = null;

	constructor(clients: Socket[]) {
		super(clients);
		if (clients.length !== 2) {
			console.error("Pong game requires exactly 2 players.");
			return ;
		}

		clients.forEach((client, index) => {
			this.players.push({
				id: client.id,
				name: client.data.user.username,
				paddle: new Paddle(index === LEFT ? 0 : GAME_WIDTH - PADDLE_WIDTH, GAME_HEIGHT / 2),
				score: 0
			});
		});
		this.ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1, 0);
		this.updateState();
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
		if (side) {
			this.players[side].score += 1;
			this.resetRound();
		}

		if (this.players[side].score >= MAX_SCORE)
			this.stopGameLoop();
	}

	private isPoint(): number {
		const ballPosition: Position = this.ball!.position();

		if (ballPosition.x <= 0)
			return (RIGHT);
		else if (ballPosition.x >= GAME_WIDTH)
			return (LEFT);
		return (0);
	}

	private updateState(): void {
		(this.state as PongState) = {
			playersState: this.players.map((player) => ({
				id: player.id,
				name: player.name,
				paddle: player.paddle.position(),
				score: player.score
			})),
			ball: this.ball!.position(),
		};
	}

	private	resetRound(): void {}
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