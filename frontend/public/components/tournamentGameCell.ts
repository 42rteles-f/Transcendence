import { BaseComponent } from '../../src/BaseComponent';
import { routes } from '../../src/routes';

interface IGameInfo {
	id:					string;
	player1DisplayName: string;
	player1Score:		string;
	player2DisplayName: string;
	player2Score: 		string;
	status:				string;
};

class TournamentGameCell extends BaseComponent {
	private player1!:		HTMLParagraphElement;
	private player1Score!:	HTMLParagraphElement;
	private player2!:		HTMLParagraphElement;
	private player2Score!:	HTMLParagraphElement;
	private info:			IGameInfo;

	constructor (gameInfo: IGameInfo) {
		super('/components/tournamentGameCell.html');
		this.info = gameInfo;
	}

	async onInit() {
		this.player1.innerText = this.info ? `player: ${this.info.player1DisplayName}` : 'player: ?';
		this.player1Score.innerText = this.info ? `score: ${this.info.player1Score}` : 'score: ?';
		this.player2.innerText = this.info ? `player: ${this.info.player2DisplayName}`: 'player: ?';
		this.player2Score.innerText = this.info ? `score: ${this.info.player2Score}` : 'score: ?';
		if (this.info && this.info?.status !== 'in progress' && this.info?.status !== 'finished') {
			this.addEventListener('click', () => routes.navigate(`/pong/${this.info.id}`));
			this.classList.add('cursor-pointer');
		}
	}
};


customElements.define('tournament-game-cell', TournamentGameCell);
export { TournamentGameCell };