    fetch('http://localhost:5000/<Login>', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": "", "password" : ""})
            })
    .then(response => response.json())
    .then(response => {
        if(response["data"]){
            //say u logged in.
        }
        else{
            //throw error
        }
    });


    fetch('http://localhost:5000/<register>', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": "", "password" : "", "confirmPassword" : ""})
            })
    .then(response => response.json())
    .then(response => {
        if(response["data"]){
            //say u logged in.
        }
        else{
            //throw appropriate error from backend.
        }
    });


    fetch('http://localhost:5000/<getuser>', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            })
    .then(response => response.json())
    .then(response => {
        if(response["data"]){
            // get user
        }
        else{
            //throw appropriate error from backend.
        }
    });