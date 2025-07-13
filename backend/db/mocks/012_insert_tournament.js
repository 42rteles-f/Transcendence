export function up(db, cb) {
  let pending = 0;
  function done() {
    pending--;
    if (pending === 0) cb();
  }

  db.serialize(() => {
    db.run(`INSERT INTO tournaments (id, name, start_date, max_players, owner_id) VALUES (1, '4 players tournament', CURRENT_TIMESTAMP, 4, 1)`);
    db.run(`INSERT INTO tournament_players (tournament_id, player_id) VALUES (1, 1), (1, 2), (1, 3), (1, 4)`);

    pending += 3;
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (1, 2, 'finished', 2)`, function(err) {
      if (!err) {
        const gameId1 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (1, ${gameId1})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (3, 4, 'finished', 3)`, function(err) {
      if (!err) {
        const gameId2 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (1, ${gameId2})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (2, 3, 'finished', 2)`, function(err) {
      if (!err) {
        const gameId3 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (1, ${gameId3})`, function() {
          db.run(`UPDATE tournaments SET status = 'finished', winner = 2 WHERE id = 1`, done);
        });
      } else {
        done();
      }
    });
  });

  db.serialize(() => {
    db.run(`INSERT INTO tournaments (id, name, start_date, max_players, owner_id) VALUES (2, '5 players tournament', CURRENT_TIMESTAMP, 5, 5)`);
    db.run(`INSERT INTO tournament_players (tournament_id, player_id) VALUES (2, 5), (2, 6), (2, 7), (2, 8), (2, 9)`);

    pending += 6;
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (5, 6, 'finished', 5)`, function(err) {
      if (!err) {
        const gameId4 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (2, ${gameId4})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (7, 8, 'finished', 7)`, function(err) {
      if (!err) {
        const gameId5 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (2, ${gameId5})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (9, NULL, 'bye', 9)`, function(err) {
      if (!err) {
        const gameId6 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (2, ${gameId6})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (5, 7, 'finished', 7)`, function(err) {
      if (!err) {
        const gameId7 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (2, ${gameId7})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (9, NULL, 'bye', 9)`, function(err) {
      if (!err) {
        const gameId8 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (2, ${gameId8})`, done);
      } else {
        done();
      }
    });
    db.run(`INSERT INTO games (player1_id, player2_id, status, winner_id) VALUES (7, 9, 'finished', 7)`, function(err) {
      if (!err) {
        const gameId9 = this.lastID;
        db.run(`INSERT INTO tournament_games (tournament_id, game_id) VALUES (2, ${gameId9})`, function() {
          db.run(`UPDATE tournaments SET status = 'finished', winner = 7 WHERE id = 2`, done);
        });
      } else {
        done();
      }
    });
  });
}

export function down(db, cb) {
  db.serialize(() => {
    db.run(`DELETE FROM tournament_games WHERE tournament_id IN (1,2)`);
    db.run(`DELETE FROM tournament_players WHERE tournament_id IN (1,2)`);
    db.run(`DELETE FROM tournaments WHERE id IN (1,2)`);
  });
  cb();
}