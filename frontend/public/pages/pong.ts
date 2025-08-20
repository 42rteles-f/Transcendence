import { BaseComponent } from "../../src/BaseComponent";
import Socket from "../../src/Socket";
import { PongRenderer3D } from "./babylonJS/render3Dpong";

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
	private renderer3D!: PongRenderer3D;

	constructor(args: string) {
		super("/pages/pong.html");
		this.localPlay = args === "local-play";
		if (args === "tournament") {
			Socket.emit("tournament-join");
		}
	}

	onInit() {
		this.setupCanvas();
		this.setupSocket();
		this.setControlKeys("w", "s", "paddle-update");
		if (this.localPlay) {
			this.setControlKeys("ArrowUp", "ArrowDown", "second-paddle-update");
			Socket.emit("pong-local-play");
		}
		else {
			Socket.emit("pong-find-match");
		}
		this.canvas.tabIndex = 0;
		this.canvas.focus();
		this.canvas.style.outline = "none";
	}

	private setupCanvas() {
		if (!this.canvas.id) {
			this.canvas.id = "pongCanvas";
		}

		const canvasWidth = this.canvas.width || 800;
		const canvasHeight = this.canvas.height || 600;
		
		this.renderer3D = new PongRenderer3D(this.canvas.id, canvasWidth, canvasHeight);
	}

	setControlKeys(upKey: string, downKey: string, emitName: string) {
		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === upKey || event.key === downKey) {
				event.preventDefault();
				event.stopPropagation();
				Socket.emit(emitName, { direction: (event.key === upKey) ? -1 : 1 });
			}
		});
		this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.key === upKey || event.key === downKey) {
				event.preventDefault();
				event.stopPropagation();
				Socket.emit(emitName, { direction: 0 });
			}
		});
	}

	private setupSocket() {
		Socket.init();
		Socket.addEventListener("pong-state", (state: PongState) => {
			this.drawGame(state);
		});
	}

	private drawGame(state: PongState) {
		console.log("Drawing Pong Game in 3D", state);
		this.renderer3D.drawGame(state);
	}

	/*private drawGame(state: PongState) {
		console.log("Drawing Pong Game", state);
		const ctx = this.canvas.getContext("2d")!;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		state.playersState.forEach(player => {
			ctx.fillStyle = "white";
			ctx.fillRect(
				player.paddle.x, player.paddle.y,
				player.paddleDimensions.width, player.paddleDimensions.height
			);
		});

		ctx.beginPath();
		ctx.arc(state.ball.x, state.ball.y, state.ballSize, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}*/




	onDestroy() {
		Socket.emit("pong-match-leave");
		if (this.renderer3D)
			this.renderer3D.dispose();
	}
}

customElements.define("pong-game", PongGame);

export { PongGame };


	// private setKeyEvents() {
	// 	this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
	// 		if (event.key === "w" || event.key === "s") {
	// 			Socket.emit("paddle-update", { direction: (event.key === "w") ? -1 : 1 });
	// 		}
	// 	});
	// 	this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
	// 		if (event.key === "w" || event.key === "s")
	// 			Socket.emit("paddle-update", { direction: 0 });
	// 	});

	// 	if (!this.localPlay) {
	// 		Socket.emit("pong-match-find");
	// 		return;
	// 	}

	// 	Socket.emit("pong-local-play");
	// 	this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
	// 		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
	// 			Socket.emit("second-paddle-update", { direction: (event.key === "ArrowUp") ? -1 : 1 });
	// 		}
	// 	});
	// 	this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
	// 		if (event.key === "ArrowUp" || event.key === "ArrowDown")
	// 			Socket.emit("second-paddle-update", { direction: 0 });
	// 	});
	// }