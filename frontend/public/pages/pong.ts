import { BaseComponent } from "../../src/BaseComponent";
import Socket from "../../src/Socket";

console.log("executing PongGame");

interface Position {
    x: number;
    y: number;
}

interface PongPlayerState {
    id: string;
    name: string;
    paddle: Position;
	paddleDimensions: {
		width: number;
		height: number;
	};
    score: number;
}

interface PongState {
    playersState: PongPlayerState[];
    ball: Position;
	ballSize: number;
    gameStatus: string;
}

class PongGame extends BaseComponent {
    private canvas!: HTMLCanvasElement;
	private	localPlay: boolean = false;

    constructor(args: string) {
        super("/pages/pong.html");
		this.localPlay = args === "local-play";
    }

    onInit() {
        this.setupSocket();

		this.setKeyEvents();
		this.canvas.tabIndex = 0;
		this.canvas.focus();
		this.canvas.style.outline = "none";
    }

	private setKeyEvents() {
		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "w" || event.key === "s") {
				Socket.emit("paddle-update", { direction: (event.key === "w") ? -1 : 1 });
			}
		});
		this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.key === "w" || event.key === "s")
				Socket.emit("paddle-update", { direction: 0 });
		});

		if (!this.localPlay) {
			Socket.emit("pong-match-find");
			return;
		}

		Socket.emit("pong-local-play");
		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				Socket.emit("second-paddle-update", { direction: (event.key === "ArrowUp") ? -1 : 1 });
			}
		});
		this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.key === "ArrowUp" || event.key === "ArrowDown")
				Socket.emit("second-paddle-update", { direction: 0 });
		});
	}

    private setupSocket() {
        Socket.init();
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
			ctx.fillRect(
				player.paddle.x, player.paddle.y,
				player.paddleDimensions.width, player.paddleDimensions.height
			);
		});

		// Draw ball
		ctx.beginPath();
		ctx.arc(state.ball.x, state.ball.y, state.ballSize, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}

    onDestroy() {
        Socket.emit("pong-match-leave");
    }
}

customElements.define("pong-game", PongGame);

export { PongGame };
