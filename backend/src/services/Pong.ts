import GameSocket from './GameSocket';
import SocketManager from '../socket/SocketManager';
import { Socket } from 'socket.io';

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5;
const BALL_SPEED = 3;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const LEFT = 0;
const RIGHT = 1;

interface Position {
	x: number;
	y: number;
}

class Paddle {
	private x: number;
	private y: number;
	private width: number;
	private height: number;
	private speed: number;
}

class Ball {
	private x: number;
	private y: number;
	private vx: number;
	private vy: number;

	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
	}

	reset() {
		this.x = GAME_WIDTH / 2;
		this.y = GAME_HEIGHT / 2;
		this.vx = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
		this.vy = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
	}

	updatePosition() {
		this.x += this.vx;
		this.y += this.vy;
	}

	position(): Position {
		return { x: this.x, y: this.y };
	}

	reverseX() {
		this.vx = -this.vx;
	}

	collision(target: any): boolean {
		if (this.x + BALL_SIZE > target.x &&
			this.x < target.x + target.width &&
			this.y + BALL_SIZE > target.y &&
			this.y < target.y + target.height)
		{
	}}

	wallCollision(): boolean {
		if (this.y < 0 || this.y + BALL_SIZE > GAME_HEIGHT) {
			this.vy = -this.vy;
			return true;
		}
		return false;
	}

	isPoint(): Number {
		if (this.x < 0)
			return (-1);
		else if (this.x > GAME_WIDTH)
			return (1);
		return (0);
	}
}

interface State {
	ball: Ball;
	paddles: Paddle[];
}

interface Paddle {
	width: number;
	height: number;
	yPos: number;
}

class Pong extends GameSocket {
	private paddles: Paddle[] = [];
	private ball: Ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1, 0);
	// Define the game state structure
	protected state: {
		players: { [id: string]: { score: number } };
		ball: { x: number; y: number };
	} = { players: {}, ball: { x: 0, y: 0 } };

	constructor(manager: SocketManager, socket: Socket, room: string) {
		super(manager, socket, room);
		this.onInit();
	}

	protected onInit(): void {
		this.state = { players: {}, ball: { x: 0, y: 0 } };
		this.startGameLoop();
	}

	protected onPlayerJoin(socket: Socket, info?: any): void {
		this.state.players[socket.id] = { score: 0 };
		this.broadcastState();
	}

	protected onPlayerLeave(socket: Socket): void {
		delete this.state.players[socket.id];
		this.broadcastState();
	}

	protected onTick(state: any): void {
		this.ball.updatePosition();
		this.paddles[LEFT].updatePosition();
		this.paddles[RIGHT].updatePosition();

		this.paddles.forEach((paddle) => {
			this.ball.collision(paddle);
		});
		const point = this.ball.isPoint();
		if (point !== 0) {}
		this.broadcastState();
	}

	protected onRoomEmpty(): void {
		this.stopGameLoop();
	}
}

export default Pong;