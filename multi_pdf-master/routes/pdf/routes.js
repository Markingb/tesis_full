var express = require('express')
var router = express.Router()

const controllers = require('./controllers')

var multer     = require('multer')
var upload     = multer({ dest: 'raw_pdf/' })

// middleware that is specific to this router
router.use(AuthenticateToken, function timeLog (req, res, next) {
  console.log('PDF ROUTE - Time: ', Date.now())
  next()
})

// Enlistar todos los pdf cargados
router.get('/', controllers.GetFilesList)

// Sólo obtener configuración que está en memoria
router.get("/:id", controllers.GetById)

// actualizar config para un PDF en específico
router.put('/:id', controllers.UpdateById)

router.post('/upload', upload.any(), controllers.Upload)

router.post('/upload/options/:id', controllers.ExtractData)

module.exports = router