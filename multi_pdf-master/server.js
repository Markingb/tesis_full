require('dotenv').config()
const path     = require('path')
const express  = require('express')
const bodyParser = require('body-parser');
const app      = express()
const uuid     = require('uuid').v4;
const pdfParse = require('pdf-parse')

const fs       = require('fs')

// In-Memory config
global.DEFAULT_SPLIT = 2
global.PDF_CONFIG = []
global.jwt = require('jsonwebtoken');

function getCookie(name, from) {
    var nameEQ = name + "=";
    var ca = from.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

global.AuthenticateToken = function (req, res, next) {
	
	let token = '';
	if(req.headers.cookie) {
		token = getCookie('token', req.headers.cookie)
	}else {
		const authHeader = req.headers['authorization']
		token = authHeader && authHeader.split(' ')[1]
		console.log(token)
	}	
	
	if (!token) {
		return res.status(401).redirect('/login')
	}
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			console.log(err)
			return res.status(403).redirect('/login')
		}
		
		req.user = user
		next()
	})
}

const env = process.env.NODE_ENV || "development"

global.config = require('./config/config')[env]

// db
require('./models/config')
app.use(bodyParser.json());
app.use(express.static(`./node_modules/chart.js/dist`))
app.use(express.static(`./node_modules/bulma/css`))
app.use(express.static(`./node_modules/@fortawesome/fontawesome-free`))
app.use(express.static(`./src`))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());

app.use('/dashboard', require('./routes/dashboard/routes'))
app.use('/pdf',       require('./routes/pdf/routes'))
app.use('/files',     require('./routes/pdf/routes'))
app.use('/',          require('./routes/home/routes'))


global.fs = require('fs')

app.get('/', (req, res) => {
	res.status(200).send({msg:"Hello world"})
})

app.listen(config.app.port, ()=>{
	console.log(`Running on ${config.app.port}`)
});