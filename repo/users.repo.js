const {db} = require('../db/db')
const crypto = require('crypto')

const createUserQuery = (email) => {
    const id = crypto.randomUUID()
    const insertUser = db.prepare(`INSERT INTO users (id , email) VALUES (? , ?) RETURNING *`)

    const newUser = insertUser.run(id , email)

    return newUser
}

const validateEmail = (email) => {
    const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)

    if(user){
        return user
    }
}



module.exports = {createUserQuery , validateEmail}