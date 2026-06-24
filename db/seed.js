const { db } = require('./db.js')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
require('dotenv').config()

const puzzleList = JSON.parse(fs.readFileSync(path.join(__dirname , '../data/final-puzzle-list.json'), 'utf-8'))

function calculatePoints(wordBank, pangrams) {
    let maxPoints = 0
    for (const word of wordBank) {
        if (word.length === 4) {
            maxPoints++
        } else if (pangrams.includes(word)) {
            maxPoints += (7 + word.length)
        } else {
            maxPoints += word.length
        }
    }

    return {
        maxPoints: maxPoints,
        checkpoints: calculateCheckpoints(maxPoints)
    }
}

function calculateCheckpoints(maxPoints) {
    return {
        cp1: (maxPoints * .1),
        cp2: (maxPoints * .25),
        cp3: (maxPoints * .4),
        cp4: (maxPoints * .65),
        cp5: (maxPoints * .9),
    }
}

function seedPuzzles(puzzleList) {
    const puzzleKeys = Object.keys(puzzleList)

    const insertPuzzle = db.prepare(`INSERT INTO puzzles (letters, center_letter, max_points, checkpoint_1, checkpoint_2, checkpoint_3, checkpoint_4, checkpoint_5) VALUES (? , ? , ? , ? , ? , ? , ? , ?)`);

    const insertWords = db.prepare(`INSERT INTO puzzle_words (puzzle_id , word , is_pangram) VALUES (? , ? , ?)`);

    puzzleKeys.forEach(function (key) {
        let letters = key
        let centerLetter = puzzleList[key].centerLetter
        let wordBank = puzzleList[key].finalPool
        let pangrams = puzzleList[key].pangrams
        let points = calculatePoints(wordBank, pangrams)
        let maxPoints = points.maxPoints
        let cp1 = points.checkpoints.cp1
        let cp2 = points.checkpoints.cp2
        let cp3 = points.checkpoints.cp3
        let cp4 = points.checkpoints.cp4
        let cp5 = points.checkpoints.cp5

        const result = insertPuzzle.run(letters, centerLetter, maxPoints, cp1, cp2, cp3, cp4, cp5);

        const puzzleId = result.lastInsertRowid

        for (const word of puzzleList[key].finalPool) {
            let isPangram = 0
            if (pangrams.includes(word)) {
                isPangram = 1
            }

            const result = insertWords.run(puzzleId, word, isPangram);
        }

    })

}

function seedUsers(){
    const primaryUserEmail = process.env.PRIMARY_USER_EMAIL
    const uuid = crypto.randomUUID()
    db.prepare(`INSERT INTO users (id , email) VALUES (? , ?)`).run(uuid , primaryUserEmail)
}

function primePuzzle(){
    const puzzle = db.prepare(`
        SELECT id FROM puzzles WHERE has_been_shown = 0 ORDER BY RANDOM() LIMIT 1
    `).get()
    db.prepare(`UPDATE puzzles SET is_todays_puzzle = 1 WHERE puzzles.id = ?`).run(puzzle.id)
}

db.exec('DELETE FROM puzzle_words');
db.exec('DELETE FROM puzzles');


seedPuzzles(puzzleList);
seedUsers();
primePuzzle()
console.log('done')


