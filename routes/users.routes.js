const express = require('express')
const { createCanvas } = require('@napi-rs/canvas')
const router = express.Router()


const { auth } = require('../auth/auth')

router.post('/sign-in', auth)

router.get('/og-image', (req, res) => {
    const { score } = req.query

    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext('2d')

    // background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 1200, 630)

    // score text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 80px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Interspellar`, 600, 200)
    ctx.fillText(`Score: ${score}`, 600, 350)
    ctx.fillText(`Rank: Galaxy brain` ,  600 , 450)

    const buffer = canvas.toBuffer('image/png')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
})

router.get('/share' , (req , res) => {
    const {score} = req.query

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta property="og:title" content="Interspellar" />
            <meta property="og:description" content="I scored ${score} points on Interspellar!" />
            <meta property="og:image" content=${process.env.NODE_ENV === "development" ? `"http://localhost:4001/api/og-image?score=${score}"` :`"https://api.interspellar.org/api/og-image?score=${score}"`} />
            <meta property="og:url" content=${process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : "https://interspellar.org"} />
            <meta http-equiv="refresh" content="0;url=${process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : "https://interspellar.org"}" />
        </head>
        <body>Redirecting...</body>
        </html>
        `)
})

module.exports = router
