import { BaseComponent } from "../../src/BaseComponent";
import { showToast } from "./toastNotification";

console.log("executing TicTacToePage.ts");


class ticTacToePage extends BaseComponent {
	private ticTacToeCells!: NodeListOf<HTMLDivElement>;
	private currentPlayer: string = "X";

	constructor() {
		super("/pages/ticTacToe.html");
	}

	onInit() {
		this.currentPlayer = "X";
		console.log("Tic Tac Toe Page initialized");
		this.ticTacToeCells = this.querySelectorAll(".tic-tac-toe-cell") as NodeListOf<HTMLDivElement>;
		this.ticTacToeCells.forEach((cell) => {
			cell.onclick = () => {
				if (cell.classList.contains("occupied")) {
					showToast("Cell already occupied!", 2000, "error");
					return;
				}
				cell.classList.add("occupied");
				cell.classList.add(this.currentPlayer === "X" ? "x-cell" : "o-cell");
				cell.innerText = this.currentPlayer;
				this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
				this.checkGameStatus();
			};
		}
		);
	}

	checkGameStatus() {
		const cells = Array.from(this.ticTacToeCells);
		const winningCombinations = [
			[cells[0], cells[1], cells[2]], // Row 1
			[cells[3], cells[4], cells[5]], // Row 2
			[cells[6], cells[7], cells[8]], // Row 3
			[cells[0], cells[3], cells[6]], // Column 1
			[cells[1], cells[4], cells[7]], // Column 2
			[cells[2], cells[5], cells[8]], // Column 3
			[cells[0], cells[4], cells[8]], // Diagonal 1
			[cells[2], cells[4], cells[6]]  // Diagonal 2
		];

		for (const combination of winningCombinations) {
			if (combination.every(cell => cell.classList.contains("occupied") && cell.classList.contains("x-cell"))) {
				showToast("Player X wins!", 2000, "info");
				setTimeout(() => this.resetGame(), 2000);
				return;
			}
			if (combination.every(cell => cell.classList.contains("occupied") && cell.classList.contains("o-cell"))) {
				showToast("Player O wins!", 2000, "info");
				setTimeout(() => this.resetGame(), 2000);
				return;
			}
		}

		if (cells.every(cell => cell.classList.contains("occupied"))) {
			showToast("It's a draw!", 2000, "info");
			setTimeout(() => this.resetGame(), 2000);
		}
	}

	resetGame() {
		this.ticTacToeCells.forEach((cell) => {
			cell.classList.remove("occupied", "x-cell", "o-cell");
			cell.innerText = "";
		});
		this.currentPlayer = "X";
		// routes.navigate("/tic-tac-toe");
	}
}

customElements.define("tic-tac-toe-page", ticTacToePage);

export { ticTacToePage };