(()=>{

    function LoadFile(){
        var x = document.getElementById("file_name");
        var txt = "";
        if ('files' in x) {
            if (x.files.length == 0) {
                txt = "Select one or more files.";
            } else {
                for (var i = 0; i < x.files.length; i++) {
                    var file = x.files[i];
                    if ('name' in file) {
                        txt += file.name;
                    }
                }
            }
        } 
        else {
            if (x.value == "") {
                txt += "Select one or more files.";
            } else {
                txt += "The files property is not supported by your browser!";
                txt  += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
            }
        }
        document.getElementById("file_value").innerHTML = txt;
        document.getElementById("load_file").style.display = "none";
        document.getElementById("upload_file").style.removeProperty('display');

    }
    document.getElementById("file_name").addEventListener("change", LoadFile)
    document.getElementById("upload_file").style.display = "none";

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    const token = getCookie('token')

    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            // FileReader function for read the file.
            var fileReader = new FileReader();
            var base64;
            // Onload of file read the file content
            fileReader.onload = function(fileLoadedEvent) {
                base64 = fileLoadedEvent.target.result;
                // Print data in console
                base64 = base64.replace("data:application/pdf;base64,","")
                return resolve(base64);
            };
            // Convert data to base64
            fileReader.readAsDataURL(file);

        })
        
        
    }

    function UploadFile(e){ 

        const file = document.getElementById("file_name").files[0]

        const url = "/pdf/upload/"
        // const base64Content = 
        convertToBase64(file)
            .then(base64Content => {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/base64',
                        FileName: file.name,
                        splitValue: 2,
                        authorization: `Bearer ${token}`
                    },
                    body: base64Content,
                })
                .then((response) => response.json())
                .then(data => {
                    console.log(data)
                    location.reload();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            })
            .catch(err => {
                console.error(err)
            })
        
    }

    function ProcessFile(e) {

        // Ruta exacta donde se encuentra el nombre del PDF
        const filename = (e.target.parentElement.parentElement.childNodes[1].innerHTML).replace(/.PDF/i,"")
        
        const url = `/pdf/upload/options/${filename}`
        fetch(url, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`
            },
        })
        .then((response) => response.json())
        .then(data => {
            console.log(data)
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function DeleteFile(e){
        const filename = e.target.parentElement.parentElement.childNodes[1].innerHTML
        console.log(`This would delete ${filename}`)
    }

    document.getElementById("upload_file").addEventListener("click", UploadFile)
    
    const trs = document.getElementsByTagName("tr") // 

    for(let i = 0;i < trs.length; i++){
        trs[i].childNodes[3].childNodes[1].addEventListener("click", ProcessFile)
        trs[i].childNodes[3].childNodes[3].addEventListener("click", DeleteFile)
    }
    
})()