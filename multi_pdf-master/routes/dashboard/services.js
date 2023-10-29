const Student      = require('../../models/student')
const Subject      = require('../../models/subject')
const SubjectScore = require('../../models/subjectScore')
module.exports = {
    GetCareers, GetSubjects, GetSubjectScore, GetGraduates, UpdateBachillerato, UpdateTitulado
}


function GetCareers() {
    return new Promise((resolve, reject) => {
        Student.find().distinct('career', (error, docs) => {
            if(error) reject(error)
            resolve(docs)
        });
    })   
}

function GetSubjects(career){

	return new Promise((resolve,reject)=>{
		Subject.find({ career: career}, (error , docs) => {
			if(error) reject(error)
			resolve(docs)
		});
	})
}

function GetSubjectScore(subject){
	return new Promise((resolve,reject)=> {
		SubjectScore.find({cveMateria: subject}, function(error, docs){
			if(error) {
				console.log(error)
				reject(error)			
			}

			let statistics = GetStatistics(docs)
			const subjectName = Subject.find({cve: subject},'name').exec()
			subjectName.then(data=>{
				statistics.subject = data[0].name
				
				resolve({
					subject: data[0].name      ,
					media:   statistics.media  ,
					mediana: statistics.mediana,
					moda:    statistics.moda
				})
			}).catch(err=>{
				console.log(err)
				reject(err)
			})
		})
	})
}

function GetStatistics(docs){
	const total = docs.length
	// Obtener la media
	let sum = 0
	let grades = []
	let moda = []
	for(let i = 0; i < docs.length; i++){
		grades.push(docs[i].grade.number) // To be used in mediana
		if(!moda[docs[i].grade.number]){
			moda[docs[i].grade.number] = [] // To be used in moda
		}
		moda[docs[i].grade.number].push(docs[i].grade.number)
		
		sum += docs[i].grade.number
	}	
	// Obtener la mediana
	let sorted = grades.sort((a, b) => a - b)
	let mediana = 0
	let half = 0
	if(sorted.length == 1){
		mediana = sorted[0]
	}else if (sorted.length == 2){
		mediana = (sorted[0] + sorted[1]) / 2
	}else if(sorted % 2 == 0){
		// Necestamos obtener la media de los 2 número que están en el medio
		half = sorted.length / 2
		mediana = (sorted[half] + sorted[half+1]) / 2
		console.log(`===\n${(sorted[half] + sorted[half+1]) / 2}`)
	}else{
		hhalf = Math.ceil((sorted.length / 2))
		mediana = sorted[half]
	}

	// Process y obtener moda
	let bigger = 0
	Object.keys(moda).forEach((key, val) => {
		if(moda[key].length > bigger){
			bigger = key
		}
	})

	return {
		media: (sum/total).toFixed(3),
		mediana: mediana,
		moda: bigger
	}
}

function GetGraduates(career){
	return new Promise((resolve, reject) => {
		Student.find({career:career},{"_id":0,"accountId":1,"generacion":1,"egresado":1,"titulado":1,"bachillerato":1}, (err, docs) => {
			if(err) {
				console.log(err)
				reject(err)
			}
				/*
                Iterar data
                 por cada elemento, revisar si el "from" no está guardado ya que este define el inicio, 
                 crear un nuevo elemento y meter todo el objeto
                 para poder obtener "Cohortes generacionales"

            */
            let graduates = []
            let cohortes = []
            Object.keys(docs).forEach((key, val) => {
            	let from = docs[key].generacion.from
                if(!graduates[from]){
                	cohortes.push(from)
                    graduates[from] = {}
                    graduates[from].graduates = []
                    graduates[from].cohorte = 0
                }
                graduates[from].graduates.push(docs[key])

            })
            
            
            /*
				Obtener cohorte generacional por generación
            */
            Object.keys(graduates).forEach((key, val)=>{
            	Object.keys(graduates[key].graduates).forEach((ke,va)=>{
            		if(graduates[key].graduates[ke].egresado.totalMaterias == graduates[key].graduates[ke].egresado.materiasAprobadas)
            			graduates[key].cohorte++
            	})
            })
            
            Object.keys(graduates).forEach((key, val)=>{
            	
            	graduates[key].cohorte = graduates[key].cohorte / graduates[key].graduates.length * 100
            })
            graduates = graduates.filter(function (el) {
		 		return el != null;
			});
			// console.log('Actual')
			// console.log(gradua)
			resolve({graduates, cohortes})
		})
	})
}

function UpdateBachillerato(accountId, value){
	return new Promise((resolve, reject) => {

		Student.findOne({ accountId: accountId }, (err, foundStudent) => {
			if(err) {
				return reject(err)
			}
			if(foundStudent === null) {				
				return reject(`No student with id ${accountId}`)
			}else {
				Student.where({ _id: foundStudent._id }).updateOne(
					{ $set: {
						bachillerato: value
					} }, () => { // callback for updateOne
						return resolve({accountId: accountId, action: "updated"})
					}
				).exec() // student.save		
			}
		});	// Student.findOne		
	}) // return new Promise
}

function UpdateTitulado(accountId, value){

	return new Promise((resolve, reject) => {
		Student.findOne({ accountId: accountId }, (err, foundStudent) => {

			if(err) {
				return reject(err)
			}

			if(foundStudent === null) {				

				reject(`No student with id ${accountId}`)
			}else {
				Student.where({ _id: foundStudent._id }).updateOne(
					{ $set: {
						titulado: value
					} }, () => { // callback for updateOne
						return resolve({accountId: accountId, action:"updated"})
					}
				).exec() // student.save		
			}
		});	// Student.findOne		
	}) // return new Promise
}

