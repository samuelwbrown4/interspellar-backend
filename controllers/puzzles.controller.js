const {getAllPuzzlesQuery , getTodaysPuzzleQuery , getUserFoundWordsQuery, checkWordListQuery , checkFoundWordQuery , addUserFoundWordQuery} = require('../repo/puzzles.repo')

const getAllPuzzles = (req , res) => {
    try{
        let puzzles = getAllPuzzlesQuery()
        res.status(200).json({puzzles})
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const getTodaysPuzzle = (req , res) => {
    try{
        let puzzle = getTodaysPuzzleQuery()
        res.status(200).json({puzzle})
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const getUserFoundWords = (req , res) => {
    try{
        const {puzzleId , userId} = req.params
        let words = getUserFoundWordsQuery(userId , puzzleId)
        res.status(200).json({words})
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const submitWord = (req , res) => {
    try{
        const {payload} = req.body
        const {word , userId , puzzleId} = payload
        let alreadyFound = checkFoundWordQuery(word , userId , puzzleId)
        if(alreadyFound){
            return res.status(200).json({message: 'Already Found'})
        }
        let wordInList = checkWordListQuery(payload)
        if(!wordInList){
            return res.status(200).json({message: 'Word not in list'})
        }
        let submittedWord = addUserFoundWordQuery(payload)
         console.log('submittedWord:', submittedWord) 
        res.status(201).json({submittedWord})
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

module.exports = {getAllPuzzles , getTodaysPuzzle , getUserFoundWords , submitWord}