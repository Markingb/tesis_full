var express = require('express')
var router = express.Router()

const controllers = require('./controllers')

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('HOME ROUTE / - Time: ', Date.now())
  next()
})

// Enlistar todos los pdf cargados
router.get('/', AuthenticateToken, controllers.Home)
router.get('/login', controllers.LoginHome)
router.post('/login', controllers.Login)

module.exports = router