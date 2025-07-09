import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database('./db/db.sqlite3');

function ensureMigrationsTable() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      err => (err ? reject(err) : resolve())
    );
  });
}

async function getMigrations(migrationsDir = 'migrations') {
  const dir = path.join(__dirname, migrationsDir);
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .sort();
  const migrations = await Promise.all(
    files.map(async file => {
      const modulePath = path.join(dir, file);
      const migration = await import(`file://${modulePath}`);
      return {
        name: `${migrationsDir}/${file}`,
        ...migration
      };
    })
  );
  return migrations;
}

function hasRunMigration(name) {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1 FROM migrations WHERE name = ?', [name], (err, row) => {
      if (err) reject(err);
      else resolve(!!row);
    });
  });
}

function recordMigration(name) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO migrations (name) VALUES (?)', [name], err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function run(direction, migrationsDir = 'migrations') {
  await ensureMigrationsTable();
  const migrations = await getMigrations(migrationsDir);

  if (direction === 'down') {
    migrations.reverse();
  }

  for (const migration of migrations) {
    if (direction === 'up') {
      if (await hasRunMigration(migration.name)) {
        console.log(`SKIP ${migration.name} (already run)`);
        continue;
      }
    }
    console.log(`${direction.toUpperCase()} ${migration.name}`);
    await new Promise((resolve, reject) => {
      const action = migration[direction];
      if (!action) return resolve();
      action(db, err => {
        if (err) reject(err);
        else resolve();
      });
    });
    if (direction === 'up') await recordMigration(migration.name);
    if (direction === 'down') {
      db.run('DELETE FROM migrations WHERE name = ?', [migration.name], () => {});
    }
  }
}

const direction = process.argv[2];
const migrationsDir = process.argv[3] || 'migrations';

if (!['up', 'down'].includes(direction)) {
  console.log('Usage: node migrate.js up|down [migrationsDir]');
  process.exit(1);
}

run(direction, migrationsDir).then(() => db.close());
