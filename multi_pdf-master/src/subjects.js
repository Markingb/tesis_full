(()=>{
	'use strict'

	// Add event listener on change for select
    var select = document.getElementById("careers")
    select.addEventListener('change', selectChange)

    function selectChange(e){
        
        const url = "/dashboard/subjects"
        const data = { career: select.value };

        fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((data) => {
            const backgroundColor = generateRGBA(data.length)
            const borderColor     = generateRGBA(data.length,"0.5")
            const labels          = generateLabels(data)
            const options = {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero: true
		                }
		            }]
		        },
		        labels: {
	                // This more specific font property overrides the global property
	                fontColor: 'black'
	            }
		        
		    };

		    // Send parameters to graph
            drawGraph({
            	backgroundColor : backgroundColor ,
            	borderColor     : borderColor,
            	options         : options
            }, labels)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
	
    function generateRGBA(size, borderColor='0.1'){
    	var arr = {
    		r: [],
    		g: [],
    		b: [],
    		a: []
    	};
    	// Push 'size' times between 1-255 for R
		while(arr.r.length < size){
		    var r = Math.floor(Math.random() * 255) + 1;
		    if(arr.r.indexOf(r) === -1) arr.r.push(r);
		}

		// Push 'size' times between 1-255 for G
		while(arr.g.length < size){
		    var r = Math.floor(Math.random() * 255) + 1;
		    if(arr.g.indexOf(r) === -1) arr.g.push(r);
		}

		// Push 'size' times between 1-255 for B
		while(arr.b.length < size){
		    var r = Math.floor(Math.random() * 255) + 1;
		    if(arr.b.indexOf(r) === -1) arr.b.push(r);
		}

		let rgba = []
		for(let i = 0; i < arr.r.length; i++){
			rgba.push(`rgba(${arr.r[i]},${arr.g[i]},${arr.b[i]},${borderColor})`)
		}
		return rgba;
    }

    function generateLabels(data){
    	
    	// Sort values
    	data.sort(function (a, b) {return a.media - b.media;});

    	let labels = {
    		labels:  [],
    		media:   [],
    		moda:    [],
    		mediana: []
    	}

    	for(let i = 0; i < data.length; i++){
    		labels.labels.push (data[i].subject)
    		labels.media.push  (data[i].media)
    		labels.moda.push   (data[i].moda)
    		labels.mediana.push(data[i].mediana)
    	}

    	return labels
    }

    function drawGraph(options, data){
    	Chart.defaults.global.defaultFontSize = 9
    	if(!options.backgroundColor) throw "No backgroundColor specified"
    	if(!options.borderColor) throw "No borderColor specified"
    	if(!options.options) throw "No options specified"
    	const datasets = [{
	        label: 'Calificación promedio',
	        data: data.media,
	        backgroundColor: options.backgroundColor,
	        borderColor: options.borderColor,
	        borderWidth: 1
	    },{
	        label: 'Mediana',
	        data: data.mediana,
	        backgroundColor: options.backgroundColor,
	        borderColor: options.borderColor,
	        borderWidth: 1
	    },{
	        label: 'Moda',
	        data: data.moda,
	        backgroundColor: options.backgroundColor,
	        borderColor: options.borderColor,
	        borderWidth: 1
	    }];
	    const labels = data.labels
	    const type = "bar"

	    const chart = {
	        type: type,
	        data: {
	            labels: labels,
	            datasets: datasets
	        },
	        options: options
	    }

	    new Chart(document.getElementById('myChart'), chart);
    }

})()