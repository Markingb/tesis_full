const pdfkit = require('pdfkit')
const fs = require('fs')
const path = require('path')
module.exports = {createPDFDocument}

function createPDFDocument(data) {

  //  process.nextTick(() => {
      //return new Promise((resolve, reject) => {
      let pdfdocument = new pdfkit
      let file = path.resolve(`${__dirname}/Cohorte_${data.from}_${data.to}.pdf`)

      pdfdocument.pipe(fs.createWriteStream(file))

      pdfdocument.text(`Cohorte generacional ${data.from} - ${data.to}`,{align: 'center'}).fontSize(18)
      pdfdocument.text('\n \n')
      /* Índice neto de titulación */
      pdfdocument.text(`ÍNDICE NETO DE TITULACIÓN`,{align: 'center'}).fontSize(18)
      pdfdocument.text(`Número de titulados - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Número de alumnos de la cohorte - 100`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Índice neto de titulación - 10%`,{align: 'center'}).fontSize(16)
      pdfdocument.text('\n')

      /* Índice titulación */
      pdfdocument.text(`ÍNDICE DE TITULACIÓN`,{align: 'center'}).fontSize(18)
      pdfdocument.text(`Número de titulados - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Número de egresados de la cohorte - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Índice de titulación - 10%`,{align: 'center'}).fontSize(16)
      pdfdocument.text('\n')

      /* Eficiencia terminal */
      pdfdocument.text(`EFICIENCIA TERMINAL`,{align: 'center'}).fontSize(18)
      pdfdocument.text(`Número de egresados de la cohorte - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Número de alumnos de la cohorte - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Eficiencia terminal - 10%`,{align: 'center'}).fontSize(16)
      pdfdocument.text('\n')

      /* Rezago */
      pdfdocument.text(`REZAGO`,{align: 'center'}).fontSize(18)
      pdfdocument.text(`Número de titulados - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Número de alumnos de la cohorte - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Rezago del cohorte - 10%`,{align: 'center'}).fontSize(16)
      pdfdocument.text('\n')

      /* Deserción */
      pdfdocument.text(`DESERCIÓN`,{align: 'center'}).fontSize(18)
      pdfdocument.text(`Estudiantes que desertaron de la cohorte - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Número de alumnos de la cohorte - 10`,{align: 'center'}).fontSize(16)
      pdfdocument.text(`Deserción de la cohorte - 10%`,{align: 'center'}).fontSize(16)


      pdfdocument.end()
   // })
}