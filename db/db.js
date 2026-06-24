const path = require('path')
const Database = require('better-sqlite3')
const {initializeSchema} = require('./schema.js')

const db = new Database(path.join(__dirname, 'planetary-puzzles.db'));
db.exec('PRAGMA foreign_keys = ON');
initializeSchema(db)

module.exports = {db}