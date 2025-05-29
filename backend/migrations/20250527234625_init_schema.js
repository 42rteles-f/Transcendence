/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username', 50).notNullable().unique();
        table.string('nickname', 50).notNullable();
        table.string('password', 255).notNullable();
    });

    await knex.schema.createTable('games', (table) => {
        table.increments('id').primary();
        table.integer('player1').references('id').inTable('users');
        table.integer('player2').references('id').inTable('users');
        table.integer('player1_score').defaultTo(0);
        table.integer('player2_score').defaultTo(0);
    });

    await knex.schema.createTable('tournaments', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.text('start_date').defaultTo(knex.fn.now());
        table.text('end_date').defaultTo(knex.fn.now());
        table.integer('winner').references('id').inTable('users');
    });

    await knex.schema.createTable('tournament_players', (table) => {
        table.increments('id').primary();
        table.integer('tournament_id').references('id').inTable('tournaments');
        table.integer('player_id').references('id').inTable('users');
    });

    await knex.schema.createTable('tournament_games', (table) => {
        table.increments('id').primary();
        table.integer('tournament_id').references('id').inTable('tournaments');
        table.integer('game_id').references('id').inTable('games');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
	await knex.schema.dropTableIfExists('tournament_games');
	await knex.schema.dropTableIfExists('tournament_players');
	await knex.schema.dropTableIfExists('tournaments');
	await knex.schema.dropTableIfExists('games');
	await knex.schema.dropTableIfExists('users');
};