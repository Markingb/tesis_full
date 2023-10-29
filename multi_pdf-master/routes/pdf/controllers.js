
const services = require('./services')
module.exports = {GetById, GetFilesList, UpdateById, Upload, ExtractData}

function GetById (req, res, next) {
	if(!PDF_CONFIG[req.params.id]) {
		PDF_CONFIG[req.params.id] = {}
		PDF_CONFIG[req.params.id].split = DEFAULT_SPLIT
	}
	res.status(200).send({pdf: PDF_CONFIG[req.params.id]})
}

function GetFilesList(req, res) {

	const pdfPath = `${__dirname}/../../raw_pdf/`;

	if(fs.existsSync(pdfPath)){
		const pdfList = fs.readdirSync(`${__dirname}/../../raw_pdf/`) || null
		if(pdfList.length > 0) {

			res.render('pdf', {
				files: pdfList,
				assets: null,
				title: 'PDF page',
				data: {
					username:req.user.name
				}
			})
		}else {
			res.render('pdf', {
				files:null,
				assets: null,
				title: 'PDF page',
				data: {
					username:req.user.name
				}
			})
		}
		
	} else {
		res.render('pdf', {
			title: 'PDF page',
			assets: null,
			files:null,
			data: {
				username:req.user.name
			}
		})
	}
	
}

function UpdateById(req, res, next) {
	const headers = req.headers;
	const pdf     = req.params.id;
	const options = headers.options;

	// todo: desplegar directorio aquí
	if(PDF_CONFIG[pdf]) {
		PDF_CONFIG[pdf] = options;
		res.status(200).send({msg:`Configuration updated for ${pdf}`})
	}else {
		res.status(404).send({msg: `Unable to find configuration for ${pdf}`})
	}
}

function Upload(req, res)  {
	
    let body = '';
    const headers = req.headers
    req.on('data', chunk => {
        body += chunk.toString();
	});
    
    req.on('end', () => {
		const fileName = `${__dirname}/../../raw_pdf/${headers.filename}`
		if(fs.existsSync(fileName)){

			// status 204
			return res.status(200).send({msg:`El archivo \"${headers.filename}\" ya existe`}); 
		}else{
			fs.writeFile(fileName, body, 'base64', function(err) {
				if( err ) {
					console.log(err)
					res.status(500).send({msg:`Ha ocurrido un error intentando guardar el archivo \"${headers.filename}\"`});
				} else {

					if(!PDF_CONFIG[headers.filename]) {
						PDF_CONFIG[headers.filename] = {}
						PDF_CONFIG[headers.filename].split = headers.split || DEFAULT_SPLIT;
					}
					
					services.CreateRawFiles(headers.filename)
						.then(()=>{
							return res.status(200).send({msg:`Se ha guardado \"${headers.filename}\" successfully`});
						})
						.catch(err => {
							return res.status(500).send({msg:err})
						})				
				}
			});
		}			
	})      
}

function ExtractData(req, res) {
	const pdfFolder = `${__dirname}/../../extracted_files/${req.params.id}`
	if (fs.existsSync(pdfFolder)){
		const files = fs.readdirSync(pdfFolder)
		console.log(files);
		let promises = []		
		for(let i = 0; i < files.length; i++){
			let fileContent = fs.readFileSync(`${pdfFolder}/${files[i]}`, {})
			promises.push(services.extractInformation(fileContent.toString()))
		}

		Promise.all(promises)
			.then(values => {
				let storedPromises = []
				console.log(storedPromises);
				// Agrupar todas las diferentes materias por este PDf
				GroupSubjects(values)
				for(let j = 0; j < values.length; j ++) {

					// Destructing values[j] to only send relevant information
					storedPromises.push(services.StoreStudentInformation({studentInfo} = values[j]))

					// Destructing values[j] to only send relevant information
					for(let i = 0; i < values[j].subjects.length;i++) {
						storedPromises.push(services.StoreSubjectScore(values[j].subjects[i]))
					}
				}
				Promise.all(storedPromises)
					.then(result => {
						res.status(200).send({msg:'ok'})
					})
					.catch(err => {
						console.log(err)
						res.status(500).send(err)
					})
			})
			.catch(err => {
				console.log(err)
				res.status(500).send(err)
			})	
	

	}else {
		res.status(200).send({msg:`Didn't do anything against ${req.params.id}`})
	}	
}

function GroupSubjects(data){
	console.log(data);
	console.log('asies');
	let subjects = []
	for(let i = 0; i < data.length; i++){
		for(let j = 0; j < data[i].subjects.length; j++){
			subjects.push({
				name:   data[i].subjects[j].name,
				cve:    data[i].subjects[j].cve,
				career: data[i].subjects[j].career
			})
		}
	}
	let group = subjects.reduce((r, a) => {
		r[a.cve] = [...r[a.name] || [], a];
		return r;
	}, {});
	let groupedSubjects = []
	Object.keys(group).forEach((key, val) => {
		groupedSubjects.push(group[key][0])
	})
	let subjectPromises = []

	// Calling directly without using nextTick causes parallel exception
	for(let i = 0; i < groupedSubjects.length; i++){
		subjectPromises.push(services.StoreSubject(groupedSubjects[i]))
	}

	Promise.all(subjectPromises)
		.then(values => {
			console.log('Subjects stored')
		})
		.catch(err => {
			console.error(err)
		})
}
