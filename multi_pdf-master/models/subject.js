const mongoose = require('mongoose');
const SubjectSchema = new mongoose.Schema({
	cve: String,
	name: String,
	career: String
})

const Subject  = mongoose.model('Subject', SubjectSchema)

module.exports = Subject;