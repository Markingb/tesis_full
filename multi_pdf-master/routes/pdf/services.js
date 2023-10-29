const uuid                 = require('uuid').v4;
const pdfParse             = require('pdf-parse')
const EXTRACTED_FILES_PATH = "extracted_files"

const Student      = require('../../models/student')
const SubjectScore = require('../../models/subjectScore')
const Subject      = require('../../models/subject')

const utils        = require('./utils')

/**
 * Represents a Subject.
 * @constructor
 */
class SubjectType {
  constructor(cve, name, accountId, grade, type, folio, career) {
	this.cve = cve
	this.name = name
    this.accountId = accountId
    this.grade = {
    	number: grade.number,
    	letter: grade.letter
    } 
    this.type = type
    this.folio = folio
    this.career = career
  }
}

module.exports = {
	extractInformation, CreateRawFiles, StoreStudentInformation, StoreSubject, StoreSubjectScore
}

function FixSpaces(string){
	// reemplazar saltos de línea
	string = string.replace(/\n+/g,"")

	// reemplazar 'n' espacios por 1
	string = string.replace(/\s+/g," ")

	// Remover último caracter si es un espacio
	string = string.substring(string.length -1) == " " ? string.slice(0,-1) : string
	string = string.substring(0,1) == " " ? string.slice(1) : string

	// recursion
	if(string.substring(string.length -1) == " ")
		FixSpaces(string)
	if(string.substring(0, 1) == " ")
		FixSpaces(string)

	return string;
}

function extractInformation(data){


	let value;
	let subjects = []

	/*
		In order to easily track contents, we are using regex "Named capturing groups"
		Reference: https://www.regular-expressions.info/named.html
	*/

	// todo: ask for format ####:Name
	let numberAndFacultyMatch = data.match(/(?<facultyNumber>\d+)\-(?<facultyName>[a-z-áéíóú\s]+)/i)

	// todo: ask for Capital Name
	let studentNameMatch      = data.match(/C\.\s(?<studentName>[A-ZÁÉÍÓÚ\s]+)/)

	// todo: ask for hyphen
	let accountIdMatch        = data.match(/(?<accountId>\d+(\-\d{1}))/)

	const careerMatch           = data.match(/carrera([\s,\n])?(?<career>[A-ZÁÉÍÓÚ\s]+)/)
	const promedioMatch         = data.match(/(?<promedio>((?<=PROMEDIO:\s*)([0-9]{1,2}(\.[0-9]{1,3})?)))/)
	const generacionMatch       = data.match(/(?<generacion>(([0-9]{4}) - [0-9]{4}))(?=(\nGENERACIÓN))/)
	const semesterHeader        = "(?<semester>[A-Z]+ SEMESTRE)"
	const columnsHeader         = "CVE\\s*M A T E R I A\\s*CALIF\\s*TIPO\\s*FOLIO"
	const promedioHeader        = "PROMEDIO"
	const egresadoMatch         = data.match(/(?<egresado>P\s\d{1,2}\sK\s\d{1,2}\sR\s\d{1,2})/)
	
	// Verify if it has groups & value for each capturing group
	let studentName   = studentNameMatch      && studentNameMatch.groups      ? studentNameMatch.groups.studentName                          : undefined
	let accountId     = accountIdMatch        && accountIdMatch.groups        ? accountIdMatch.groups.accountId                              : undefined	
	let career        = careerMatch           && careerMatch.groups           ? careerMatch.groups.career.replace("\n"," ")                  : undefined
	let facultyNumber = numberAndFacultyMatch && numberAndFacultyMatch.groups ? numberAndFacultyMatch.groups.facultyNumber                   : undefined
	let facultyName   = numberAndFacultyMatch && numberAndFacultyMatch.groups ? numberAndFacultyMatch.groups.facultyName.replace("\n"," ")   : undefined
	let promedio      = promedioMatch         && promedioMatch.groups         ? promedioMatch.groups.promedio                                : undefined
	let generacion    = generacionMatch       && generacionMatch.groups       ? generacionMatch.groups.generacion                            : undefined
	let egresado      = egresadoMatch         && egresadoMatch.groups         ? egresadoMatch.groups.egresado                                : undefined

	let totalMateriasMatch      = egresado.match(/(?<totalMaterias>(?<=P\s)\d{1,2})/)
	let materiasAprobadasMatch  = egresado.match(/(?<materiasAprobadas>(?<=K\s)\d{1,2})/) 
	let materiasReprobadasMatch = egresado.match(/(?<materiasReprobadas>(?<=R\s)\d{1,2})/) 

	let totalMaterias      = totalMateriasMatch      && totalMateriasMatch.groups      ? totalMateriasMatch.groups.totalMaterias      : undefined
	let materiasReprobadas = materiasReprobadasMatch && materiasReprobadasMatch.groups ? materiasReprobadasMatch.groups.materiasReprobadas : undefined
	let materiasAprobadas  = materiasAprobadasMatch  && materiasAprobadasMatch.groups  ? materiasAprobadasMatch.groups.materiasAprobadas   : undefined
	egresado = {totalMaterias, materiasAprobadas, materiasReprobadas}
	
	studentName = FixSpaces(studentName)
	career      = FixSpaces(career)	
	facultyName = FixSpaces(facultyName)

	// Since this is a string, special characters need
	// to be espaced, otherwise, they won't be recognized    
    const main = "(?<cve>\\d{4})(\\s*)(?<subject>([a-z-A-ZÁÉÍÓÚÑ]*\\s)+)(?<gradeNumber>\\d{1,2})(\\s*)?(?<gradeLetter>[a-z-A-Z]+)(\\s+)?(?<type>[a-z-A-Z])(\\s*)?(?<folio>\\d{1,8})(\\n(\\s*)?(?<extraLine>([a-z-A-ZÁÉÍÓÚÑ]+(\\s+)?)*))?"
    const MainRegex = new RegExp(main, 'g')

    // Initialize semester
    let semester = "PRIMER SEMESTRE"

    return new Promise((resolve, reject) => {

    	// REF: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
    	// On the first filter, we need to get line by line, having $main as pattern
    	while ((value = MainRegex.exec(data)) !== null) {

			value = value[0]		

			// Extract current semestre value to isolate subject's on
			// each semester for future references
			let d = value.match(semesterHeader)
			if (d && d.groups) semester = d.groups.semester

			// Once we have extracted Semestre value, we can remove it from matching current value
			// Otherwise it'll be part of Subject's value			
			const removeSemesterHeader = new RegExp(semesterHeader)
			value = value.replace(removeSemesterHeader,"")
			
			const removepromedioHeader = new RegExp(promedioHeader)
			value = value.replace(removepromedioHeader,"")

			// We need to remove columnsHeader value since it matches with
			// our main regex pattern
			const removeColumnsHeader = new RegExp(columnsHeader)
			value = value.replace(removeColumnsHeader,"")


			let match = value.match(main)
			
			if ( match && match.groups ) {
				
				// if we have second line, let's contact
				let subject = match.groups.extraLine ? match.groups.subject + (match.groups.extraLine.replace(/( +)/g, " ")) : match.groups.subject

				subject = FixSpaces(subject)

				// Store matching subject into an array
				subjects.push(new SubjectType(
					match.groups.cve,
					subject,
					accountId, 
					{
						number: match.groups.gradeNumber,
						letter: match.groups.gradeLetter
					},
					match.groups.type,
					match.groups.folio,
					career //career
				))		

			}else {
				console.log(`Could not be added as subject`)
			}
		}
		return resolve({
			subjects:subjects,
			studentInfo: {
				studentName, accountId, career, facultyNumber, facultyName, promedio, generacion, egresado
			}
		})
    })	
}


// Extraer los PDF hacia TXT para su posterior extracción con REGEX
function CreateRawFiles(file){
	
	return new Promise((resolve, reject) => {
		let dataBuffer     = fs.readFileSync(`${__dirname}/../../raw_pdf/${file}`);
	
		const uniqueFolder = file.replace(/.PDF/i,"");
		const dir = `${__dirname}/../../${EXTRACTED_FILES_PATH}/${uniqueFolder}`;

		// Si existe un directorio asociado al pdf, necesitamos
		// borrar su contenido para no repetir
		if(fs.existsSync(dir) ){
			let pdfList = fs.readdirSync(dir)		
			for(let i = 0; i < pdfList.length; i++){	
				utils.executeAsync(()=>{
					fs.unlinkSync(`${dir}/${pdfList[i]}`)
				})
			}
			fs.mkdirSync(dir, {recursive: true})
		} else {
			fs.mkdirSync(dir, {recursive: true}) // so hard
		}

		pdfParse(dataBuffer)
			.then(data => {	 
				//antes "Hoja"
				let content = data.text.split("(www.tcpdf.org)undefined")
				
				// Necesitamos hacer grupos de 2 por cada archivo, tenemos que iterar el valor de content
				// Comenzaremos desde index 1 , index 0 es vacío
				//antes let i =1
				for(let i = 1; i < content.length; i += PDF_CONFIG[file].split) {		
					
					let _file_ = `${dir}/${uuid()}.txt`
					let _content_ = ''
					
					for(let j = 0; j < PDF_CONFIG[file].split; j++) {
						_content_ += content[i+j]
					}

					fs.appendFile(_file_, _content_, (err) => {
						if (err) throw err;
						
						// At this point, raw file has been saved
						resolve()
					});
				}
			})
			.catch(err=>{
				reject(err)
			})
	})
	

}
function StoreStudentInformation(data){
	console.log(data)
	let auxGeneracion = data.studentInfo.generacion.match(/(?<generacion>(\d{4}))/g)

	data.studentInfo.generacion = {}
	data.studentInfo.generacion.from = auxGeneracion[0]
	data.studentInfo.generacion.to = auxGeneracion[1]

	return new Promise((resolve, reject) => {
		let student = {}
		student = new Student(data.studentInfo) // Student
		Student.findOne({ accountId: data.studentInfo.accountId }, (err, foundStudent) => {
			if(err) return reject(err)

			if(foundStudent === null) {
				
				student.save( (err, student) => {
					if (err) return reject(err);
					return resolve({accountId: student.accountId, action:"added"})
				}) // student.save

			}else {
				Student.where({ _id: foundStudent._id }).updateOne(
					{ $set: {
						studentName:   data.studentInfo.studentName,
						accountId:     data.studentInfo.accountId,
						career:        data.studentInfo.career,
						facultyNumber: data.studentInfo.facultyNumber, 
						facultyName:   data.studentInfo.facultyName,
						promedio:      data.studentInfo.promedio,
						generacion: {
							from: data.studentInfo.generacion.from,
							to: data.studentInfo.generacion.to
						}
					} }, () => { // callback for updateOne
						return resolve({accountId: student.accountId, action:"updated"})
					}
				).exec() // student.save		
			}
		});	// Student.findOne		
	}) // return new Promise
}

async function StoreSubjectScore(data){
	let subjectScore = {}
	
	return new Promise((resolve, reject) => {
		subjectScore = new SubjectScore({
			cveMateria: data.cve,
			accountId: data.accountId, 
			grade: {
				number: data.grade.number,
				letter: data.grade.letter
			},
			type: data.type, 
			folio: data.folio
		}) // SubjectScore

		SubjectScore.findOne({ accountId: data.accountId, cveMateria: data.cve }, (err, foundSubjectScore) => {
			if(err) return reject(err)

			if(foundSubjectScore === null) {
				
				subjectScore.save( (err, r) => {
					if (err) return reject(err);
					return resolve({accountId: data.accountId, cveMateria: data.cve, action:"added"})
				}) // subjectScore.save

			}else {

				SubjectScore.where({ _id: subjectScore._id }).updateOne(
					{ $set: {
						grade: {
						number: data.grade.number,
						letter: data.grade.letter
					},
					type: data.type, 
					folio: data.folio
					} }, () => { // callback for updateOne
						return resolve({accountId: data.accountId, cveMateria: data.cve, action:"updated"})
					}
				).exec() // subjectScore.save		
			}
		});	// subjectScore.findOne
	})
	
}

function StoreSubject(subject) {
	
	let _subject = new Subject(subject)
	return new Promise((resolve, reject) => {
		Subject.findOne({cve: _subject.cve}, (err, foundSubject) => {
		if(err) return reject(err)
		if(foundSubject === null) {
			_subject.save((err, r) => {
				if (err) return reject(err)
				return resolve({_subject, action:"added"})
			}) // subject.save
		}  else {
			Subject.where({_id: foundSubject._id}).updateOne({$set:{name:_subject.name}}, () => {
				return resolve({_subject, action:"updated"})
			}).exec()
		}
		}) // Subject.findOne
	}) // return new Promise
}