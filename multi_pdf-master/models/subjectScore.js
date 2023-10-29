const mongoose = require('mongoose');
const SubjectScoreSchema = new mongoose.Schema({
	cveMateria: Number,
	accountId: String,
	grade: {
		number: Number,
		letter: String
	},
	type: String,
	folio: Number //,
	//areaAcademica
});


const SubjectScore = mongoose.model('SubjectScore', SubjectScoreSchema)
module.exports = SubjectScore