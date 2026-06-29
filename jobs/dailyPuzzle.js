const {db} = require('../db/db')
const cron = require('node-cron')

const newDailyPuzzle = () => cron.schedule('59 3 * * *' ,() => {
    db.prepare(`UPDATE puzzles
                    SET is_todays_puzzle = 0,
                        has_been_shown = 1
                    WHERE is_todays_puzzle = 1
        `).run()

    const puzzle = db.prepare(`
        SELECT id FROM puzzles WHERE has_been_shown = 0 ORDER BY RANDOM() LIMIT 1
    `).get()

    db.prepare(`UPDATE puzzles
                    SET is_todays_puzzle = 1
                WHERE id = ?
        `).run(puzzle.id)

        console.log('New daily puzzle!')
})

module.exports = {newDailyPuzzle}