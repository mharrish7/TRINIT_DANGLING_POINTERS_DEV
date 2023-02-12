document.querySelector('.subBtn').addEventListener("click",function(){
    const signupBtn=document.querySelector('.subBtn');
    signupBtn.disabled=true;
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
    fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": document.querySelector('#username').value, "password" : document.querySelector('#password').value})
            })
    .then(response => response.json())
    .then(response => {
        signupBtn.disabled=true;
        if(response["data"]){
            console.log(response["data"]);
            history.go(-1);
        }
        else{
            console.log("check here");
        }
    })
}
signupBtn.disabled=false;
}
);
