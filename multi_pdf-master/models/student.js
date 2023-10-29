const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
	studentName:String,
	accountId: String,
	career: String,
	facultyNumber: Number,
	facultyName: String,
	promedio:Number,
	generacion: {
		from: Number,
		to: Number
	},
	egresado: {
		totalMaterias: Number,
		materiasAprobadas: Number,
		materiasReprobadas: Number
	},
	titulado: {
		type: String,
		enum: ["Promedio", "Tesina servicio social", "Tesis", "Inglés (TOEFL)", "EGEL", "Diplomado", "Experiencia Profesional","N/A"],
		default: 'N/A'
	},
	bachillerato: {
		type: String,
		enum: ["UAS","Conalep","Cobaes","Cecyt","N/A"],
		default: 'N/A'
	},
	reg_time: {
		type: Date, 
		default: Date.now
	}
})

const Student  = mongoose.model('Student', StudentSchema)

module.exports = Student;