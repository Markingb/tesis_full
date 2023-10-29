const uuid     = require('uuid').v4;
const pdfParse = require('pdf-parse')

module.exports = {
	executeAsync, CreateRawFiles
}

const EXTRACTED_FILES_PATH = "extracted_files"
function executeAsync(callback) {
	return process.nextTick(callback)
}
// Extraer los PDF hacia TXT para su posterior extracción con REGEX
function CreateRawFiles(file){
	let dataBuffer     = fs.readFileSync(`${__dirname}/../../raw_pdf/${file}`);
	const uniqueFolder = file.replace(".PDF","");

	const dir = `${__dirname}/../../${EXTRACTED_FILES_PATH}/${uniqueFolder}`;

	// Si existe un directorio asociado al pdf, necesitamos
	// borrar su contenido para no repetir
	if(fs.existsSync(dir) ){
		let pdfList = fs.readdirSync(dir)
		
		for(let i = 0; i < pdfList.length; i++){	
			executeAsync(()=>{
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

				fs.appendFile(_file_, _content_, function (err) {
					if (err) {
						console.log(err)
						throw err
					}
				});
			}
		})
		.catch(err=>{
			console.log(err)
		})
}