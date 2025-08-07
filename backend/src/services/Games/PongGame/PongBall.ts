import {
    Position,
    Collidable,
    BALL_SIZE,
    BALL_SPEED,
    GAME_HEIGHT,
    GAME_WIDTH,
} from "./PongTypes";

class PongBall implements Collidable {
    public x: number;
    public y: number;
    public width = BALL_SIZE;
    public height = BALL_SIZE;
    private vx: number;
    private vy: number;
    public speed: number = BALL_SPEED;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() < 0.5 ? 1 : -1);
        this.vy = (Math.random() < 0.5 ? 1 : -1);    }

    public onCollision(target: Collidable): boolean {
        if (
            this.x + this.width >= target.x &&
            this.x < target.x + target.width &&
            this.y + this.height > target.y &&
            this.y < target.y + target.height
        ) {
            const targetCenter = target.y + target.height / 2;
            const ballCenter = this.y + this.height / 2;
            const angle = (ballCenter - targetCenter) / (target.height / 2);
            this.vy = angle * this.speed;
            this.vx = -this.vx;
            this.speed += 0.5;
            return true;
        }
        return false;
    }

    public reset(position: Position, speed: number): void {
        this.x = position.x;
        this.y = position.y;
        this.vx = (Math.random() < 0.5 ? 1 : -1);
        this.vy = (Math.random() < 0.5 ? 1 : -1);
        this.speed = speed;
    }

    public update(): void {
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
        this.wallCollision();
    }

    public nextPosition(): Position {
        return {
            x: this.x + this.vx,
            y: this.y + this.vy,
        };
    }

    public position(): Position {
        return { x: this.x, y: this.y };
    }

    private wallCollision(): boolean {
        if (this.y < 0 || this.y + BALL_SIZE > GAME_HEIGHT) {
            this.vy = -this.vy;
            this.speed += 0.5;
            return true;
        }
        return false;
    }

    public isPoint(): Number {
        if (this.x < 0) return 1;
        else if (this.x > GAME_WIDTH) return 2;
        return 0;
    }
}

export default PongBall;
