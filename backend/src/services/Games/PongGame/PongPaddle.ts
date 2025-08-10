import {
    Collidable,
    Position,
    PADDLE_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_SPEED,
    GAME_HEIGHT,
} from "./PongTypes";

class PongPaddle implements Collidable {
    public width = PADDLE_WIDTH;
    public height = PADDLE_HEIGHT;
    public x: number;
    public y: number;
    private direction: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.direction = 0;
    }

    public onCollision(target: Collidable): Boolean {
        return false;
    }

    public changeDirection(direction: number) {
        if (direction < -1 || direction > 1) direction = 0;
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
        return { x: this.x, y: this.y };
    }
}

export default PongPaddle;
