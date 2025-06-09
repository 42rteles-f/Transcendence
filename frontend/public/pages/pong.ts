import { BaseComponent } from "../../src/BaseComponent";

console.log("executing PongGame");

class PongGame extends BaseComponent {
	constructor() {
		super("/pages/pong.html");
	}

	onInit() {
		const canvas = this.querySelector("#pong-canvas") as HTMLCanvasElement;
		const ctx = canvas.getContext("2d")!;
		let x = canvas.width / 2;
		let y = canvas.height / 2;
		let dx = 2;
		let dy = 2;
		const radius = 10;

		function drawBall() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = "white";
			ctx.fill();
			ctx.closePath();

			if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
			if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;

			x += dx;
			y += dy;

			requestAnimationFrame(drawBall);
		}

		drawBall();
	}
}

customElements.define("pong-game", PongGame);

export { PongGame };
