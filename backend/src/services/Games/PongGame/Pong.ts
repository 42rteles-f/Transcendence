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
	x: number;
	y: number;
}

interface Paddle {
	width: number;
	height: number;
	yPos: number;
}

interface PongPlayer {
	id: string;
	paddle: Paddle;
	score: number;
}

interface Collidable {
	x: number;
	y: number;
	width: number;
	height: number;
	onCollision(target: Collidable): Boolean;
}

interface PongLimits {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

interface PongState {
	score: PongScore[];
	ball: Position;
	paddleLeft: Position;
	paddleRight: Position;
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

	onCollision(target: Collidable): Boolean {
		return (false);
	}

	update() {
		this.y += this.direction;
	}

	position(): Position {
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

	onCollision(target: Collidable): boolean {
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

	reset() {
		this.x = GAME_WIDTH / 2;
		this.y = GAME_HEIGHT / 2;
		this.vx = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
		this.vy = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
	}

	nextPosition(): Position {
		return ({
			x: this.x + this.vx,
			y: this.y + this.vy
		});
	}

	position(): Position {
		return { x: this.x, y: this.y };
	}

	reverseX() {
		this.vx = -this.vx;
	}

	wallCollision(): boolean {
		if (this.y < 0 || this.y + BALL_SIZE > GAME_HEIGHT) {
			this.vy = -this.vy;
			return true;
		}
		return false;
	}

	isPoint(): Number {
		if (this.x < 0)
			return (1);
		else if (this.x > GAME_WIDTH)
			return (2);
		return (0);
	}
}

class Pong extends GameSocket {
	private	players: PongPlayer[] = [];
	private paddles: Paddle[] = [];
	private ball: Pointer<Ball> = null;

	constructor(manager: SocketManager, socket: Socket, room: string) {
		super(manager, socket, room);
		this.onInit();
	}

	protected onInit(): void {
		this.state = { players: {}, ball: { x: 0, y: 0 } };
		this.ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1, 0);
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

	protected onTick(): void {
		this.ball!.update();
		this.paddles.forEach((paddle) => {
			paddle.update();
			this.ball!.onCollision(paddle);
		});

		this.update();

		(this.state as PongState) = {
			score: this.score,
			ball: this.ball!.position(),
			paddleLeft: this.paddles[LEFT].position(),
			paddleRight: this.paddles[RIGHT].position()
		};
	}

	protected update(): void {
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

	private	resetRound() {}

	protected onRoomEmpty(): void {
		this.stopGameLoop();
	}
}

export default Pong;