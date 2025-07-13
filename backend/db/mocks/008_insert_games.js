export function up(db, cb) {
    db.run(`
        INSERT INTO games (player1_id, player2_id, player1_score, player2_score, status, winner_id) VALUES
        (1, 2, 5, 11, 'finished', 2),
        (1, 2, 11, 7, 'finished', 1),
        (2, 1, 6, 11, 'finished', 1),
        (2, 1, 11, 3, 'finished', 2),
        (3, 4, 11, 5, 'finished', 3),
        (4, 3, 11, 10, 'finished', 4),
        (3, 4, 7, 11, 'finished', 4),
        (3, 4, 11, 3, 'finished', 3),
        (1, 2, 11, 5, 'finished', 1),
        (2, 1, 11, 10, 'finished', 2),
        (3, 4, 11, 7, 'finished', 3),
        (4, 3, 11, 6, 'finished', 4),
        (1, 2, 11, 9, 'finished', 1),
        (2, 1, 11, 8, 'finished', 2),
        (3, 4, 11, 5, 'finished', 3),
        (4, 3, 11, 5, 'finished', 4),
        (1, 2, 11, 2, 'finished', 1),
        (2, 1, 1, 11, 'finished', 1),
        (3, 4, 11, 4, 'finished', 3),
        (4, 3, 11, 8, 'finished', 4),
        (1, 2, 11, 4, 'finished', 1),
        (2, 1, 11, 6, 'finished', 2),
        (3, 4, 11, 2, 'finished', 3),
        (4, 3, 11, 7, 'finished', 4),
        (1, 2, 11, 9, 'finished', 1),
        (2, 1, 11, 4, 'finished', 2),
        (3, 4, 11, 3, 'finished', 3),
        (4, 3, 11, 1, 'finished', 4)
        `, cb);
}

export function down(db, cb) {
    db.run(`
        DELETE FROM games WHERE (player1_id, player2_id) IN ((1, 2), (2, 1), (3, 4), (4, 3)) AND
        (player1_score, player2_score) IN ((5, 11), (11, 7), (6, 11), (11, 3), (11, 5), (11, 10), (7, 11))`, cb);
}