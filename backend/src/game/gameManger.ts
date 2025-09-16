import GameDatabase from "../database/game";
import { dbLite }  from "../index";

type Player = {
  id: number;
  socketId: string;
};

class GameManager {
  private static instance: GameManager;
  private matchmakingQueue: Player[] = [];

  private constructor() {}

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public addPlayerToQueue(player: Player) {
    if (this.matchmakingQueue.find(p => p.id === player.id)) return;

    this.matchmakingQueue.push(player);

    if (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.shift()!;
      const player2 = this.matchmakingQueue.shift()!;
      this.createGame(player1, player2);
    }
  }

  public removePlayerFromQueue(playerId: number) {
    this.matchmakingQueue = this.matchmakingQueue.filter(p => p.id !== playerId);
  }

  private async createGame(player1: Player, player2: Player) {
	const gameDb = new GameDatabase(dbLite);
	const gameId = await gameDb.createGame(player1.id, player2.id);
	if (gameId.status !== 200) {
		// Handle error
	} else {

	}
    // Notify players
  }
}

export const GameManagerInstance = GameManager.getInstance();