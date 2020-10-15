const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
const port = 3000

app.get('/', (req, res) => {
    //res.send("IT'S WORKING!")
    res.sendfile(__dirname + '/index.html');
})

const httpsOptions = {
    key: fs.readFileSync('./cert.key'),
    cert: fs.readFileSync('./cert.pem')
}
https.createServer(httpsOptions, app)
    .listen(port, () => {
        console.log('server running at ' + port)
    })