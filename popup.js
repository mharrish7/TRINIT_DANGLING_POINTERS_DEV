
const session = new Date().getTime() / 1000;

data = "";
const button = document.querySelector('#onButton');
const allBox=document.querySelector('.onData');
const preBox=document.querySelector('.predataBox')
button.addEventListener('click', function(message){
    if(button.checked){
        allBox.style.display="contents";
        preBox.style.display="contents";
    }
    else{
        allBox.style.display="none";
        preBox.style.display="none";
    }
})



chrome.runtime.onMessage.addListener(handleBackgroundMessages);
try{
    chrome.tabs.onActiveChange.addListener(handleBackgroundMessages);
}
catch{
    console.log("no tab selected");
}
function handleBackgroundMessages(message)
{   
    data = message.property;
    const box = document.querySelector('.data');
    const curtabName= document.querySelector('.activeTab');
    var list = "testing";
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs2) {
    var curTab = new URL(tabs2[0].url).host;
    
        
    
    fetch('http://localhost:5000/getCurWebsite', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "domain": curTab})
            })
    .then(response => response.json())
    .then(response => {
        document.querySelector(".preData").innerHTML = parseInt(response["data"])*0.000000010244548;
    });
    
    var emissionData=data[curTab];
    curtabName.innerHTML=curTab;
    box.innerHTML = emissionData;
    var otherData=``;
    for(const [key, value] of Object.entries(data)){
        otherData+=`<div class='rowData'><span class=domainName>`+key+`</span><span> - > ` + value + `</span></div>`;
    }
    allBox.innerHTML=otherData;
    })
}

chrome.windows.onFocusChanged.addListener(function(window) {
    //handle close event
});


fetch('http://localhost:5000/getData', {
method: 'POST',
headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
},
body: JSON.stringify({ "user": "dummy"})
})
.then(response => response.json())
.then(response => {
        console.log(response["data"]);
});

setInterval(sendData,5000);


function sendData(){
    fetch('http://localhost:5000/getUser', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    })
    .then(response => response.json())
    .then(response => {
        if(response["data"] == ""){
            response["data"] = "dummy";
        }
    fetch('http://localhost:5000/sendData', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "user": response["data"],"data" : data, "session" : session })
                })
                .then(response => response.json())
                .then(response => console.log(JSON.stringify(response)))
        });
}