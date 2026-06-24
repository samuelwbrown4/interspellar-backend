const express = require('express')
const router = express.Router()

const {auth} = require('../auth/auth')

router.post('/sign-in' , auth)

module.exports = router
