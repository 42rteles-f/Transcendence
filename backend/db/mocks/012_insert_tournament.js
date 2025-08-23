import { randomUUID } from 'node:crypto';

export function up(db, cb) {
  let pending = 0;
  function done() {
    pending--;
    if (pending === 0) cb();
  }

  db.serialize(() => {
	const uuid = randomUUID();
db.run(`INSERT INTO tournaments (id,
								name,
								uuid,
								number_of_players,
								owner_id,
								current_round,
								number_of_rounds)
						VALUES (1,
								'4 players tournament',
								'${uuid}',
								4,
								2,
								2,
								2)`);
    db.run(`INSERT INTO tournament_players (tournament_id, tournament_uuid, player_id, display_name) VALUES (1, '${uuid}', 1, 'display 1'), (1, '${uuid}', 2, 'display 2'), (1, '${uuid}', 3, 'display 3'), (1, '${uuid}', 4, 'display 4')`);

    pending += 3;
    db.run(`INSERT INTO games (player1_id,
							   player2_id,
							   status,
							   winner_id,
							   round,
							   player1_score,
							   player2_score)
						VALUES (1,
								2,
								'finished',
								2,
								1,
								9,
								11)`, function(err) {
      if (!err) {
        const gameId1 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, tournament_uuid, game_id) VALUES (1, '${uuid}', ${gameId1})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id,
							   player2_id,
							   status,
							   winner_id,
							   round,
							   player1_score,
							   player2_score)
						VALUES (3,
								4,
								'finished',
								3,
								1,
								11,
								5)`, function(err) {
      if (!err) {
        const gameId2 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, tournament_uuid, game_id) VALUES (1, '${uuid}', ${gameId2})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id,
							   player2_id,
							   status,
							   winner_id,
							   round,
							   player1_score,
							   player2_score)
						VALUES (2,
								3,
								'finished',
								2,
								2,
								11,
								3)`, function(err) {
      if (!err) {
        const gameId3 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, tournament_uuid, game_id) VALUES (1, '${uuid}', ${gameId3})`, function() {
          db.run(`UPDATE tournaments SET status = 'finished', winner = 2 WHERE id = 1`, done);
        });
      } else {
        done();
      }
    });
  });
}

export function down(db, cb) {
  db.serialize(() => {
    db.run(`DELETE FROM tournament_games WHERE tournament_id IN (1)`);
    db.run(`DELETE FROM tournament_players WHERE tournament_id IN (1)`);
    db.run(`DELETE FROM tournaments WHERE id IN (1)`);
  });
  cb();
}