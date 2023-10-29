var express = require('express')
var router = express.Router()

const controllers = require('./controllers')
const fs = require('fs')
// middleware that is specific to this router
router.use(AuthenticateToken, function timeLog (req, res, next) {
  console.log('FILES ROUTE - Time: ', Date.now())
  next()
})

// Lectura de directorio para ver los archivos en chuncks según la configuración
// del PDF dentro de PDF_CONFIG[pdf_index]
router.get("/", controllers.GetFilesList)

// Obtener valor de 1 pdf  (raw)
app.get("/:id", controllers.GetById)

module.exports = router