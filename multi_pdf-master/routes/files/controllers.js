module.exports = {
	GetFilesList, GetById
}

function GetFilesList(req, res, next) {
	const filesList = fs.readdirSync(`${__dirname}/../../files/`)

	res.render('main', {
		files: filesList
	})
}

function GetById(req, res, next) {
	const id = req.params.id

	if (! fs.existsSync(`${__dirname}/../../files/${id}`)) {
	    res.status(404).send({msg:`${id} does not exists`});
	  }

	fs.readFile(`${__dirname}/../../files/${id}`, function (err, data) {
	  if (err) {
	    throw err; 
	  }
	  res.status(200).send({content: data.toString()})
	});	
}