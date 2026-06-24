

function initializeSchema(db){
    console.log('initializing schema...')
    db.exec(`
    CREATE TABLE IF NOT EXISTS puzzles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        letters TEXT NOT NULL,
        center_letter TEXT NOT NULL,
        has_been_shown INTEGER NOT NULL DEFAULT 0,
        is_todays_puzzle INTEGER NOT NULL DEFAULT 0,
        max_points INTEGER NOT NULL,
        checkpoint_1 INTEGER NOT NULL,
        checkpoint_2 INTEGER NOT NULL,
        checkpoint_3 INTEGER NOT NULL,
        checkpoint_4 INTEGER NOT NULL,
        checkpoint_5 INTEGER NOT NULL
    )
    `)

db.exec(`
    CREATE TABLE IF NOT EXISTS puzzle_words (
        puzzle_id INTEGER NOT NULL,
        word TEXT NOT NULL,
        is_pangram INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (puzzle_id , word),
        FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
    )
    `)

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT NOT NULL PRIMARY KEY,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
    `)

db.exec(`
  CREATE TABLE IF NOT EXISTS user_found_words (
    user_id TEXT NOT NULL,
    puzzle_id INTEGER NOT NULL,
    word TEXT NOT NULL,
    PRIMARY KEY (user_id, puzzle_id, word),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
    )
  `)
}

module.exports = {initializeSchema}
