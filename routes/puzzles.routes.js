const express = require('express')
const router = express.Router();

const {getAllPuzzles, getTodaysPuzzle , getUserFoundWords , submitWord} = require('../controllers/puzzles.controller' );

router.get('/all' , getAllPuzzles)
router.get('/daily' , getTodaysPuzzle)
router.get('/words/:puzzleId/:userId' , getUserFoundWords)
router.post('/words' , submitWord)

module.exports = router