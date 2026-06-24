const path = require('path')
const Database = require('better-sqlite3')
const {initializeSchema} = require('./schema.js')

const dbPath = process.env.NODE_ENV === 'production'
    ? 'prod.db'
    : 'dev.db'
const db = new Database(path.join(__dirname, dbPath));
db.exec('PRAGMA foreign_keys = ON');
initializeSchema(db)

module.exports = {db}