import { views } from "../views";
import { Page } from "../../src/Page";

console.log("executing pong.ts");

const pongPage = new Page("/pong");

const pongPrint = () => {
	const canvas = document.getElementById("pong-canvas") as HTMLCanvasElement;
	if (!canvas) return;

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

pongPage.setDisplay(pongPrint)
		.addEvents({id: "test_id", type: "click", handler: () => {}})
		.setHtmlFrom("/pages/pong.html")
		.includePages("/navbar");

views.registerPage("/pong", pongPage);
