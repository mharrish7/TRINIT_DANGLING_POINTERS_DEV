document.querySelector('.subBtn').addEventListener("click",function(){
    const loginBtn=document.querySelector('.subBtn');
    const registerBtn=document.querySelector('.regBtn');
    loginBtn.disabled=true;
    registerBtn.disabled=true;
    const username=document.querySelector('#username');
    const password=document.querySelector('#password');
    const uBox=document.querySelector('.ualertBox');
    const pBox=document.querySelector('.palertBox');

    if(!username.value){
        console.log("working");
        uBox.style.display='contents';
    }
    else{
        uBox.style.display='none';
    }
    if(!password.value){
        pBox.style.display='contents';
    }
    else{
        pBox.style.display='none';
    }
    if(username.value && password.value){
    fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": username.value, "password" : password.value})
            })
    .then(response => response.json())
    .then(response => {
        loginBtn.disabled=false;
        registerBtn.disabled=false;    
        if(response["data"]){
            console.log(response["data"]);
            history.go(-1);
        }
        else{
            console.log("check here");
        }
    })
}
loginBtn.disabled=false;
registerBtn.disabled=false;
}
);