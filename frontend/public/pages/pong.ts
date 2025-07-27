import { BaseComponent } from "../../src/BaseComponent";
import Socket from "../../src/Socket";

console.log("executing PongGame");

interface PaddlePosition {
    x: number;
    y: number;
}

interface PlayerState {
    id: string;
    name: string;
    paddle: PaddlePosition;
    score: number;
}

interface BallPosition {
    x: number;
    y: number;
}

interface PongState {
    playersState: PlayerState[];
    ball: BallPosition;
    gameStatus: string;
}

class PongGame extends BaseComponent {
    private canvas!: HTMLCanvasElement;
    private radius = 10;

    constructor() {
        super("/pages/pong.html");
    }

    onInit() {
        this.setupSocket();
		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "w" || event.key === "s") {
				Socket.emit("paddle-update", { direction: event.key === "w" ? -1 : 1 });
			}
		});
		this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.key === "w" || event.key === "s") {
				console.log("Key released:", event.key);
				Socket.emit("paddle-update", { direction: 0 });
			}
		});
		this.canvas.tabIndex = 0; // Make the canvas focusable
		this.canvas.focus();
		this.canvas.style.outline = "none"; // Remove focus outline
    }

    private setupSocket() {
        Socket.init();
        Socket.emit("pong-join");
        Socket.addEventListener("pong-state", (state: PongState) => {
            this.drawGame(state);
        });
    }

    private drawGame(state: PongState) {
		console.log("Drawing Pong Game", state);
		const ctx = this.canvas.getContext("2d")!;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw paddles
		state.playersState.forEach(player => {
			ctx.fillStyle = "white";
			ctx.fillRect(player.paddle.x, player.paddle.y, 10, 60);
		});

		// Draw ball
		ctx.beginPath();
		ctx.arc(state.ball.x, state.ball.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}

    onDestroy() {
        Socket.emit("pong-leave");
    }
}

customElements.define("pong-game", PongGame);

export { PongGame };
