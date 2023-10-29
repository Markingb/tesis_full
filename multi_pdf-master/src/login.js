(()=>{
    'use strict'

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

    let inputs = document.getElementsByTagName('input')

    const account = inputs[Object.keys(inputs).filter(key => inputs[key].type == 'text')]
    const password = inputs[Object.keys(inputs).filter(key => inputs[key].type == 'password')]
    document.getElementsByTagName('button')[0].addEventListener('click',Login)

    function Login(e){ 
        const url = "/login"
        const data = { username: account.value };

        fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((data) => {
            document.cookie = `token=${data.accessToken}`
            RedirectHome(data.accessToken)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function RedirectHome(token) {
        const url = "/"
        fetch(url, {
        method: 'GET',
        headers: {
           // 'authorization':`Bearer ${token}`,
           // 'extra-one':'yayyyyyyyyyyyyyyyyyy===='
        },
        })
        //.then((response) => response.json())
        .then((data) => {
            // similar behavior as an HTTP redirect
            window.location.href = "/"

        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
})()