
const services = require('./services')
const pdf = require('../../pdf/create_pdf')
module.exports = {
	Dashboard, GetSubjects, Graduates, GetGraduates, UpdateBachillerato, UpdateTitulado, cohorte
} 


function Dashboard(req, res) {
    services.GetCareers()
        .then(careers => {
            console.log("Dashboard() -> routes/dashboard/controller.js")
            console.log(careers)
            res.status(200).render('subjects',{
                title: "Subjects page",
                assets: {
                    js: [
                        "\/Chart.min.js"
                    ],
                    css: [
                        "\/Chart.min.css"
                    ]
                },
                data: {
                    username: req.user.name,
                    careers: careers        
                }
            })
        })
        .catch(err =>  {
            res.status(200).render('error',{
                title: "Subjects page",
                assets: null,
                data: {
                    username: req.user.name            
                }
            })
        })    
}

function Graduates(req, res,){
    services.GetCareers()
        .then(careers => {
            res.status(200).render('graduates',{
                title: "Graduates page",
                assets: {
                    js: [
                        "\/Chart.min.js"
                    ],
                    css: [
                        "\/Chart.min.css"
                    ]
                },
                data: {
                    username: req.user.name,
                    careers: careers        
                }
            })
        })
        .catch(err =>  {
            res.status(200).render('error',{
                title: "Subjects page",
                assets: null,
                data: {
                    username: req.user.name,
                    error: err          
                }
            })
        })     
}

function GetGraduates(req, res){
    const career = req.body && req.body.career ? req.body.career : undefined;
    if(!career) res.status(500).send({msg:'Career not sent in body'})
    services.GetGraduates(career)
        .then(graduates=>{        
            res.status(200).json(graduates)
        })
        .catch(err => {
            res.status(500).render('error', {
                title: 'Got an error',
                error: err,
                assets: null,
                data: {
                    username: req.user.name,
                    error: err
                }
            })
        })
}

function GetSubjects(req, res) {

    const career = req.body && req.body.career ? req.body.career : undefined;
    if(!career) res.status(500).send({msg:'Career not sent in body'})
    services.GetSubjects(career)
        .then(data => {
            
            let subjectPromises = []
            for(let i = 0; i < data.length; i++){
                subjectPromises.push(services.GetSubjectScore(data[i].cve))
            }

            Promise.all(subjectPromises)
                .then(data=>{
                    res.json(data)
                })
                .catch(err=>{
                    res.status(500).render('error', {
                        title: 'Got an error',
                        error: err,
                        assets: null,
                        data: {
                            username: req.user.name,
                          error: err
                        }
                    })
                })
            
        })
        .catch(err=>{
            res.status(500).render('error', {
                title: 'Got an error',
                error: err,
                assets: null,
                data: {
                    username: req.user.name,
                    error: err
                }
            })
        })
}

function UpdateBachillerato(req, res){
    const bachillerato = req.body && req.body.value ? req.body.value : undefined;
    const accountId    = req.body && req.body.accountId    ? req.body.accountId    : undefined;
    if(!bachillerato) return res.status(500).send({msg:'Bachillerato not sent in body'})
    if(!accountId)    return res.status(500).send({msg:'AccountId not sent in body'})
    services.UpdateBachillerato(accountId, bachillerato)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.status(500).render('error', {
                title: 'Got an error',
                error: err,
                assets: null,
                data: {
                    username: req.user.name,
                    error: err
                }
            })
        })
}

function UpdateTitulado(req, res){
    const titulado  = req.body && req.body.value  ? req.body.value  : undefined;
    const accountId = req.body && req.body.accountId ? req.body.accountId : undefined;
    if(!titulado)  return res.status(500).send({msg:'Bachillerato not sent in body'})
    if(!accountId) return res.status(500).send({msg:'AccountId not sent in body'})
    services.UpdateTitulado(accountId, titulado)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.status(500).render('error', {
                title: 'Got an error',
                error: err,
                assets: null,
                data: {
                    username: req.user.name,
                    error: err
                }
            })
        })
}

function cohorte(req, res){
    pdf.createPDFDocument({from:2013,to:2019})
        res.json('ok')
        return
        /*.then(data => {
            res.json(data)
        })
        .catch(err => {
            res.status(500).render('error', {
                title: 'Got an error',
                error: err,
                assets: null,
                data: {
                    username: req.user.name,
                    error: err
                }
            })
        })*/
}