const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongo_uri = 'mongodb+srv://DenisseGalindo:Denissegalindo1@cluster0.tax4e.mongodb.net/<dbname>?retryWrites=true&w=majority'
const User = require('./user')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const fs = require('fs')
const https = require('https')
const port = 3000
const secret = speakeasy.generateSecret({
    name: 'Seguridad en Redes'
})

app.get('/', (req, res) => {
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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(mongo_uri, function (err) {
    if (err) {
        throw err;
    } else {
        console.log('Conectado a mongo');
    }
})

app.get('/', (req, res) => {

})

app.post('/register', (req, res) => {
    const {
        username,
        password
    } = req.body;
    const user = new User({
        username,
        password
    })

    console.log(user)
  
    user.save(err => {
        if (err) {
            console.log('den' + err)
            res.status(500).send('Error al registralo')
        } else {
            res.status(200).send('Correctamente registrado')
        }
    })
})

app.post('/login', (req, res) => {
    //console.log(secret);
    //action="/verify" method="get"

    qrcode.toDataURL(secret.otpauth_url, function (err, data) {
        console.log(data);
    })
    const {
        username,
        password
    } = req.body;
    console.log(username)
    console.log(password)

    User.findOne({
        user:username
    }, (err, user) => {
        if (err) {
            res.status(200).send('ERROR AL AUTENTICAR')
        } else if (!user) {
            res.status(500).send('EL USUARIO NO ESTA REGISTRADO')
        } else {
            user.isPSWcorrect(password, (err, result) => {
                if (err) {
                    console.log(err)
                    res.status(500).send('ERROR AL AUTENTICAR 300')
                } else if (result) {
                    res.status(200).redirect('/qrcode')
                } else {
                    res.status(500).send('USER OR PASSWORD INCORRECT')
                }
            })
        }
    })
})

app.get('/verify', (req, res)=>{
    let verified = speakeasy.totp.verify({
        secret: secret.ascii,
        encoding: 'ascii',
        token: req.query.token
    })
    
    console.log(verified);
    if(verified == true) {
        console.log('Correcto, redireccionando');
        res.status(200).send('Token correcto')
    } else {
        console.log('Incorrecto');
        res.status(500).send('Token correcto')
    }
    //console.log(req.query.token);
    //console.log('FUERA DE LA FUNCION'+secret.ascii);
})

app.get('/qrcode', (req, res) => {

    qrcode.toDataURL(secret.otpauth_url, function (err, data_url) {
        //console.log(data_url.ascii);
        //console.log('DENTRO DE LA FUNCION' + secret.ascii);


        res.end('    <!DOCTYPE html>\
        <html lang="en">\
        <head>\
            <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">\
            <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>\
            <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>\
            <meta charset="UTF-8">\
            <link rel="stylesheet" href="style.css">\
            <meta name="viewport" content="width=device-width, initial-scale=1.0">\
            <title>Login</title>\
        </head>\
        <body>\
            <div id="login">\
                <h3 class="text-center text-white pt-5">Escanea</h3>\
                <div class="container">\
                    <div id="login-row" class="row justify-content-center align-items-center">\
                        <div id="login-column" class="col-md-6">\
                            <div id="login-box" class="col-md-12">\
                                <form id="login-form" class="form" method="get" action="/verify">\
                                    <h3 class="text-center text-info">Se ha generado tu Codigo QR</h3>\
                                    <img src="' + data_url + '" alt="qr">\
                                    <p>Tu llave es: "' + secret.ascii + '"  </p>\
                                    <div class="form-group">\
                                        <label for="token" class="text-info">token:</label><br>\
                                        <input type="text" name="token" id="token" class="form-control">\
                                    </div>\
                                    <div class="form-group">\
                                    <button onclick="verify()">Verificar token</button>\
                                    </div>\
                                </form>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </body>\
        </html>');
    });

})




app.listen(3001, () => {
    console.log('Running');
})

module.exports = app;