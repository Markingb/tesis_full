var express = require('express')
var router = express.Router()

const controllers = require('./controllers')

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('DASHBOARD ROUTE / - Time: ', Date.now())
  next()
})

router.get('/subjects', AuthenticateToken, controllers.Dashboard)
router.post('/subjects', AuthenticateToken, controllers.GetSubjects)
router.get('/graduates', AuthenticateToken, controllers.Graduates)
router.post('/graduates', AuthenticateToken, controllers.GetGraduates)

/* actualización de valores */
router.post('/graduates/bachillerato', AuthenticateToken, controllers.UpdateBachillerato)
router.post('/graduates/titulado', AuthenticateToken, controllers.UpdateTitulado)

/* generación de PDF cohorte */
router.post('/graduates/cohorte', AuthenticateToken, controllers.cohorte)
module.exports = router