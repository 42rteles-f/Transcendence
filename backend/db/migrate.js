import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database('./db/db.sqlite3');

async function getMigrations() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .sort();
	const migrations = await Promise.all(
		files.map(async file => {
			const modulePath = path.join(dir, file);
			const migration = await import(`file://${modulePath}`);
			return {
			name: file,
			...migration
			};
		})
	);
	console.log(`Found ${migrations.length} migrations:`, migrations.map(m => m.name).join(', '));
	return migrations;
}

async function run(direction) {
  const migrations = await getMigrations();

  if (direction === 'down') {
    migrations.reverse();
  }

  for (const migration of migrations) {
    console.log(`${direction.toUpperCase()} ${migration.name}`);
    await new Promise((resolve, reject) => {
      const action = migration[direction];
      if (!action) {
        return resolve();
      }
      action(db, err => {
        if (err)
			reject(err);
        else
			resolve();
      });
    });
  }
}

const direction = process.argv[2];
if (!['up', 'down'].includes(direction)) {
  console.log('Usage: node runMigrations.js up|down');
  process.exit(1);
}

run(direction).then(() => db.close());