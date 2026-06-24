const {db} = require('../db/db')

const getAllPuzzlesQuery = () => {
    const puzzles = db.prepare(`
        SELECT * FROM puzzles LIMIT 10
        `).all()
    return puzzles
};

const getTodaysPuzzleQuery = () => {
    const puzzle = db.prepare(`
        SELECT * FROM puzzles WHERE is_todays_puzzle = 1
    `).get()
    
    const words = db.prepare(`
        SELECT word, is_pangram FROM puzzle_words WHERE puzzle_id = ?
    `).all(puzzle.id)
    
    return { ...puzzle, words }
}

const checkWordListQuery = (payload) => {
    const {word , userId , puzzleId} = payload
    const matchWord = db.prepare(`
        SELECT 
            word,
            is_pangram
        FROM puzzle_words
        WHERE puzzle_id = ? AND word = ?
        `).get(puzzleId , word.toLowerCase())

     if(matchWord){
        return true
     }   


    return false
}

const addUserFoundWordQuery = (payload) => {
     const {word , userId , puzzleId} = payload

     let submittedWordId = db.prepare(`INSERT INTO user_found_words (puzzle_id , user_id , word) VALUES (? , ? , ?)`).run(puzzleId , userId , word.toLowerCase()).lastInsertRowid

    let submittedWord = db.prepare(`SELECT user_found_words.word , puzzle_words.is_pangram FROM user_found_words JOIN puzzle_words ON puzzle_words.puzzle_id = user_found_words.puzzle_id AND puzzle_words.word = user_found_words.word WHERE user_found_words.puzzle_id = ? AND user_found_words.user_id = ? AND user_found_words.word = ?`).get(puzzleId , userId , word.toLowerCase())

     return submittedWord
}

const getUserFoundWordsQuery = (userId , puzzleId) => {
    const foundWords = db.prepare(`SELECT user_found_words.word AS word , puzzle_words.is_pangram 
                                    FROM user_found_words
                                       JOIN puzzle_words ON puzzle_words.word = user_found_words.word 
                                        AND puzzle_words.puzzle_id = user_found_words.puzzle_id
                                    WHERE user_found_words.puzzle_id = ? AND user_found_words.user_id = ? `).all(puzzleId , userId)

    return foundWords
}

const checkFoundWordQuery = (word , userId , puzzleId) => {
    const wordAlreadyFound = db.prepare(`SELECT word FROM user_found_words WHERE word = ? AND user_id = ? AND puzzle_id = ?`).get(word.toLowerCase() , userId , puzzleId)

    if(wordAlreadyFound){
        return true
    }

    return false
}

module.exports = {getAllPuzzlesQuery , getTodaysPuzzleQuery , checkWordListQuery , getUserFoundWordsQuery , checkFoundWordQuery , addUserFoundWordQuery}