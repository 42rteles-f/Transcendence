class PongBall {
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

export default PongBall;