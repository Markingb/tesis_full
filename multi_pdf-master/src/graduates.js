(()=>{
    'use strict'
    // Add event listener on change for select
    let careerSelect = document.getElementById("careers")

    careerSelect.addEventListener('change', selectChange)

    let studentsData = {}
    let canDownload = false;

    function selectChange(e){
        const url = "/dashboard/graduates"
        const data = { career: careerSelect.value };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((data) => {
                DrawCohortes(data.cohortes.sort())
                studentsData = data
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    function Draw(e){

        /*
            Necesitamos saber el index seleccionado para poder obtener sobre ese mismo
            index sobre studentsData.graduates[element], es decir:
            studentsData.cohortes  = [2012,2013,2014,...]
            studentsData.graduates = [[data0],[data1],[data2]]
            Si seleccionamos 2012, obtendremos el data0, 2013 obtendremos data1, etc.
        */

        // Si la tabla ya existe, borrarla
        let tableExists = document.getElementById('table')
        if(tableExists) {
            tableExists.remove()
            let headerCohorte = document.getElementById('headerCohorte')
            headerCohorte.remove()
        }

        let element = e.target.selectedIndex - 1
        let cohorte = e.target.options[e.target.selectedIndex].text        
       
        // const graduateMethod = ["Promedio", "Tesina servicio social", "Tesis", "Inglés (TOEFL)", "EGEL", "Diplomado", "Experiencia Profesional"];
        // const bachilleratos = ["UAS","Conalep","Cobaes","Cecyt"]
        let random = ""
        const content = document.getElementById("content")


        var header = document.createElement("header");
        header.classList.add("card-header");

        var p = document.createElement("p");
        p.id = 'headerCohorte'
        p.classList.add("card-header-title")
        p.classList.add("has-background-danger-light")
        
        p.innerHTML = `Generación ${studentsData.graduates[element].graduates[0].generacion.from}-${studentsData.graduates[element].graduates[0].generacion.to} / Cohorte generacional ${cohorte}`

        header.appendChild(p)
        content.appendChild(header)

        var card_content = document.createElement("div");
        card_content.classList.add("card-content");

        var _content = document.createElement("div");
        _content.classList.add("content");

        var _table = document.createElement("table");
        _table.id = 'table'
        _table.classList.add("table");

        var _thead = document.createElement("thead");
        var _tfoot = document.createElement("tfoot")

        var _tr = document.createElement("tr");

        var _th ;

        const headers = ["Usuario","Total materias","Total aprobadas","Total reprobadas","Egresado","De","A","Titulado","Bachillerato"]

        for(header in headers){
            _th = document.createElement("th")
            _th.innerHTML = headers[header]
            _tr.appendChild(_th)
        }
        
        // Crear una copia del _tr, de otra manera, el último
        // objeto a dodne es añadido, es el que permanece
        // var _trCopy = _tr.cloneNode(true);

        _thead.appendChild(_tr)
        //_tfoot.appendChild(_trCopy)
        _table.appendChild(_thead)        
        // _table.appendChild(_tfoot)  

        var _tbody = document.createElement("tbody");
        studentsData.graduates[element].graduates.forEach((item) => {           
            _tr = document.createElement("tr")

            _th = document.createElement("th")
            _th.innerHTML = item.accountId
            _tr.appendChild(_th)

            _th = document.createElement("th")
            _th.innerHTML = item.egresado.totalMaterias
            _tr.appendChild(_th)

            _th = document.createElement("th")
            _th.innerHTML = item.egresado.materiasAprobadas
            _tr.appendChild(_th)

            _th = document.createElement("th")
            _th.innerHTML = item.egresado.materiasReprobadas
            _tr.appendChild(_th)

            _th = document.createElement("th")
            if (item.egresado.totalMaterias == item.egresado.materiasAprobadas){
                _th.innerHTML = "Egresado"
            }else {
                _th.innerHTML = "No egresado"
            }
            _tr.appendChild(_th)

            _th = document.createElement("th")
            _th.innerHTML = item.generacion.from
            _tr.appendChild(_th)

            _th = document.createElement("th")
            _th.innerHTML = item.generacion.to
            _tr.appendChild(_th)

            _th = document.createElement("th")
            _th.addEventListener('click', updateTitulado)
            _th.innerHTML = item.titulado
            _tr.appendChild(_th)

             _th = document.createElement("th")
             _th.addEventListener('click', updateBachillerato)
            _th.innerHTML = item.bachillerato
            _tr.appendChild(_th)

            // Ir añadiendo cada row al tbody, de otra manera, 
            // sólo el último será visible en la tabla
            _tbody.appendChild(_tr)
            
            _table.appendChild(_tbody)
            _table.appendChild(_tfoot)

            content.appendChild(_table)

        })        
    }

    function updateTitulado(e){
        let parent = e.target.parentElement;
        let accountId = parent.firstChild.innerHTML
        const tituladoEnum = ["Promedio", "Tesina servicio social", "Tesis", "Inglés (TOEFL)", "EGEL", "Diplomado", "Experiencia Profesional","N/A"]
        let text = "Favor de ingresar opción de titulación: "

        for (var i = 0; i <= tituladoEnum.length - 1; i++) {
            text += `\n${i+1}. ${tituladoEnum[i]}`
        }
        let result = prompt(text)
        if(result > 0 && result < tituladoEnum.length + 1) {
            let titulado = tituladoEnum[result - 1]
            requestUrl(
                '/dashboard/graduates/titulado', 
                { accountId: accountId, value: titulado }, 
                'POST',
                e
            )
        }else{
            console.error('invalid input')
        }
    }

    function updateBachillerato(e){
        let parent = e.target.parentElement;
        let accountId = parent.firstChild.innerHTML
        const bachilleratoEnum = ["UAS","Conalep","Cobaes","Cecyt","N/A"]
        let text = "Favor de ingresar opción de titulación: "

        for (var i = 0; i <= bachilleratoEnum.length - 1; i++) {
            text += `\n${i+1}. ${bachilleratoEnum[i]}`
        }
        let result = prompt(text)
        if(result > 0 && result < bachilleratoEnum.length + 1) {
            let bachillerato = bachilleratoEnum[result - 1]
            requestUrl(
                '/dashboard/graduates/bachillerato',
                { accountId: accountId, value: bachillerato },
                'POST',
                e
            )
        }else{
            console.error('invalid input')
        }
    }

    function requestUrl(url, data, method, e){        

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(d => {
                e.target.innerHTML = data.value
            })
            .catch(error => console.error('Error:', error));
            
    }

    function DrawCohortes(cohortes){

        // Parent donde añadiremos el select con los cohortes
        let parent = document.getElementById('options')
        parent.classList.add("control")
        parent.classList.add("has-icons-left")

        let divCohortes = document.createElement('div')
        divCohortes.classList.add("select")

        let selectCohortes = document.createElement('select')
        selectCohortes.id = "selectCohortes"

        // Crear y añadir cada option
        let option = document.createElement('option')
        option.text = "Seleccionar cohorte"
        option.setAttribute('disabled', 'disabled')
        option.setAttribute('selected', 'selected');
        selectCohortes.appendChild(option)
        for (var i = 0; i < cohortes.length; i++) {
            option = document.createElement("option");
            option.value = cohortes[i];
            option.text = cohortes[i];
            selectCohortes.appendChild(option);
        }

        divCohortes.appendChild(selectCohortes)        
        document.addEventListener('change',Draw);
        parent.appendChild(divCohortes)
    }
})()