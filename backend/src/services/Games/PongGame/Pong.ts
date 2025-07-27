import GameSocket from '../GameSocket';
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
	gameStatus:		string;
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
		console.log(`Paddle direction changed to ${direction}`);
		this.direction = direction;
	}

	public update(): void {
		this.y += this.direction * PADDLE_SPEED;
		if (this.y < 0) {
			this.y = 0;
		} else if (this.y + this.height > GAME_HEIGHT) {
			this.y = GAME_HEIGHT - this.height;
		}
	}

	public reset(position: Position): void {
		this.x = position.x;
		this.y = position.y;
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
			console.log(`Ball collided with paddle at (${this.x}, ${this.y})`);
			const targetCenter = target.y + target.height / 2;
			const ballCenter = this.y + this.height / 2;
			const angle = (ballCenter - targetCenter) / (target.height / 2);
			this.vy = angle * this.speed;
			this.vx = -this.vx;
			// this.x = target.x + target.width;
			return (true);
		}
		return (false);
	}

	public reset(position: Position, speed: number): void {
		this.x = position.x;
		this.y = position.y;
		this.vx = speed * (Math.random() < 0.5 ? 1 : -1);
		this.vy = speed * (Math.random() < 0.5 ? 1 : -1);
	}

	// public reset(): void {
	// 	this.x = GAME_WIDTH / 2;
	// 	this.y = GAME_HEIGHT / 2;
	// 	this.vx = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
	// 	this.vy = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
	// }

	public update(): void {
		this.x += this.vx * this.speed;
		this.y += this.vy * this.speed;
		this.wallCollision();
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
				paddle: new Paddle(index === LEFT ? 0 : GAME_WIDTH - PADDLE_WIDTH, GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2),
				score: 0
			});
			this.addEventHook(client, `paddle-update`, ({ direction }: { direction: number }) => {
				this.players[index].paddle.changeDirection(direction);
			});
		});

		this.ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2 - BALL_SIZE / 2, 1, 0);
		this.status = 'playing';
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
				score: player.score
			})),
			ball: this.ball!.position(),
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
		this.stopGameLoop();
		this.removeEventHook(`paddle-update`);
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