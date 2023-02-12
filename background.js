var version = "1.0";
var tabs = {};



class Response {
  constructor(url, options) {
      this._options = options;
      this.url = url;
      this.entries = new Map();
  }
}

class ResponseBuilder {

static processEvent(stats, {method, params}) {
   const methodName = `_${method.replace('.', '_')}`;
   const handler = ResponseBuilder[methodName];
   if (handler) {
       handler(stats, params);
   }
}


static _Network_requestWillBeSent(stats, params) {
   const {requestId} = params;
   stats.entries[requestId] = {
       encodedResponseLength: undefined,
   };
}

static _Network_loadingFinished(stats, params) {
   const {requestId, timestamp, encodedDataLength} = params;
   const entry = stats.entries[requestId];
   if (!entry) {
       return;
   }
   entry.encodedResponseLength = encodedDataLength;
   stats._responseBodyCounter++;
}

}

var globalID = "";
let stats = null;
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.storage.local.get(['tabs'], function(result) {
    const tabs = result.tabs;
    globalID = activeInfo.tabId;
    // chrome.action.setTitle({tabId: globalID, title: 'Click to stop'});
    // chrome.debugger.attach({tabId:globalID}, version, onAttach.bind(null, globalID));
    // chrome.debugger.sendCommand({tabId:globalID}, "Network.enable");
    if(tabs?.[activeInfo.tabId]) {
      chrome.action.setTitle({tabId: activeInfo.tabId, title: 'Click to stop'});
    } else {
      chrome.action.setTitle({tabId: activeInfo.tabId, title: 'Click to start'});
    }
  });
});

var requests = 0;
var Alldata = {};
var totaldata = 0;

var previousDomain = "";

function getTransferData(pages,domain){
  totaldata = 0;
  var tominus = 0;
  if(previousDomain != "" && previousDomain != domain){
    tominus = Alldata[previousDomain];
  }
  for(const [Page,stats] of pages.entries()){
    const entries = [...Object.values(stats.entries)]
        .map((entry) => {totaldata += entry.encodedResponseLength?entry.encodedResponseLength:0;requests += 1;})
        .filter((entry) => entry);
  }
  if(Alldata[domain] != undefined){
    Alldata[domain] = totaldata - tominus;
  }
  else{
    Alldata[domain] = 0;
  }
  chrome.runtime.sendMessage( { property: Alldata } );
  
}

let MaxVal = {}

chrome.tabs.onUpdated.addListener(function(){
  MaxVal[previousDomain] += Alldata[previousDomain];
  stats = new Response();
  console.log("sdsd", MaxVal);
})

var eventListenerInit = false;


var opened = false;

var attached = [];

chrome.action.onClicked.addListener(function(tab) {
  chrome.storage.local.get(['tabs'], async function(result) {
    // let newTabs = result.tabs;
    if(!opened){
    chrome.windows.create({url:"index.html", type : 'panel', width : 700, height : 700});
    // opened = true
    }
    // if(newTabs?.[tab.id] && false) {
    //   chrome.debugger.detach({tabId:tab.id});
    //   chrome.action.setTitle({tabId: tab.id, title: 'Click to start.'});
    //   try{
    //      const fileName = new URL(tab.url).host;
    //      getTransferData([tabs[tab.id]], fileName);
    //   } catch(error) {
    //     console.log(error);
    //   }
    //   newTabs[tab.id] = undefined;
    //   await writeTabObject(newTabs);
    //   console.log("tab closed");
    //   console.log(`Action clicked: Tab ${tab.id} now unregistered.`);
    // } else {


      // tabs[globalID] = stats;
      // newTabs[globalID] = stats;
      // await writeTabObject(newTabs);
      try{
        chrome.action.setTitle({tabId: globalID, title: 'Click to stop'});
        chrome.debugger.attach({tabId:globalID}, version, onAttach.bind(null, globalID));
        chrome.debugger.sendCommand({tabId:globalID}, "Network.enable");
      }
      catch{
        console.log("No tab active");
      }

      chrome.debugger.onEvent.addListener(async (debuggeeId, method, params) => {
        eventListenerInit = true;
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs2) {
            var curTab = new URL(tabs2[0].url).host;
            const fileName = curTab;
            if(tabs2[0].id == globalID){
              ResponseBuilder.processEvent(stats, {method, params});
              tabs[globalID] = stats;

              if(method === "Network.loadingFinished"){
                // console.log(fileName);
                // console.log(stats);
                getTransferData([tabs[globalID]], fileName);
              }
            }
          });
      });
    }
  );
});

function recreateNode(el, withChildren) {
  if (withChildren) {
    el.parentNode.replaceChild(el.cloneNode(true), el);
  }
  else {
    var newEl = el.cloneNode(false);
    while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
    el.parentNode.replaceChild(newEl, el);
  }
}

// chrome.tabs.onUpdated.addListener(function
//   (tabId, changeInfo, tab) {
//     recreateNode(chrome.debugger.onEvent);
//     chrome.storage.local.get(['tabs'], async function(result) {
//       let newTabs = result.tabs;
      
//       if(newTabs?.[tab.id] && false) {
//         chrome.debugger.detach({tabId:tab.id});
//         chrome.action.setTitle({tabId: tab.id, title: 'Click to start.'});
//         try{
//            const fileName = new URL(tab.url).host;
//            getTransferData([tabs[tab.id]], fileName);
//         } catch(error) {
//           console.log(error);
//         }
//         newTabs[tab.id] = undefined;
//         await writeTabObject(newTabs);
//         console.log("tab closed");
//         console.log(`Action clicked: Tab ${tab.id} now unregistered.`);
//       } else {
  
//         if(!newTabs) {
//           newTabs = {};
//         }
        
//         let stats = new Response();
//         tabs[tab.id] = stats;
//         newTabs[tab.id] = stats;
//         console.log(stats);
//         await writeTabObject(newTabs);
//         chrome.action.setTitle({tabId: tab.id, title: 'Click to stop'});
//         chrome.debugger.attach({tabId:tab.id}, version, onAttach.bind(null, tab.id));
//         chrome.debugger.sendCommand({tabId:tab.id}, "Network.enable");
//         chrome.debugger.onEvent.addListener(async (debuggeeId, method, params) => {
//           eventListenerInit = true;
          
//             chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs2) {
//               var curTab = new URL(tabs2[0].url).host;
//               const fileName = new URL(tab.url).host;
//               if(fileName == curTab){
//                 ResponseBuilder.processEvent(stats, {method, params});
//                 tabs[tab.id] = stats;
//                 if(method === "Network.loadingFinished"){
//                   getTransferData([tabs[tab.id]], fileName);
//                 }
//               }
//             });
//         });
//       }
//     });
    
//   }
// );

// chrome.tabs.onActivated.addListener(function(tab) {
//   chrome.storage.local.get(['tabs'], async function(result) {
//     let newTabs = result.tabs;
//     if(!opened){
//     let tab
//     chrome.windows.create({url:"index.html", type : 'panel', width : 700, height : 700});
//     opened = true
//     }
//     if(newTabs?.[tab.tabId] && false) {
//       chrome.debugger.detach({tabId:tab.id});
//       chrome.action.setTitle({tabId: tab.id, title: 'Click to start.'});
//       try{
//          const fileName = new URL(tab.url).host;
//          getTransferData([tabs[tab.id]], fileName);
//       } catch(error) {
//         console.log(error);
//       }
//       newTabs[tab.id] = undefined;
//       await writeTabObject(newTabs);
//       console.log("tab closed");
//       console.log(`Action clicked: Tab ${tab.id} now unregistered.`);
//     } else {

//       if(!newTabs) {
//         newTabs = {};
//       }

//       let stats = new Response();
//       tabs[tab.tabId] = stats;
//       newTabs[tab.tabId] = stats;
//       await writeTabObject(newTabs);
//       chrome.action.setTitle({tabId: tab.tabId, title: 'Click to stop'});
//       chrome.debugger.attach({tabId:tab.tabId}, version, onAttach.bind(null, tab.tabId));
//       chrome.debugger.sendCommand({tabId:tab.tabId}, "Network.enable");
//       recreateNode(chrome.deb);
//       chrome.debugger.onEvent.addListener(async (debuggeeId, method, params) => {
//         eventListenerInit = true;
        
//           chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs2) {
//             var curTab = new URL(tabs2[0].url).host;
//             const fileName = new URL(tab.url).host;
//             if(fileName == curTab){
//               ResponseBuilder.processEvent(stats, {method, params});
//               tabs[tab.tabId] = stats;
//               if(method === "Network.loadingFinished"){
//                 getTransferData([tabs[tab.id]], fileName);
//               }
//             }
//           });
          
        
//       });
//     }
//   });
// });





function onAttach(tabId) {
  if (chrome.runtime.lastError) {
    alert(chrome.runtime.lastError.message);
    return;
  }
  else{
    attached.push(tabId);
  }
}



function writeTabObject(tabs) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ tabs }, function(result) {
      resolve(tabs);
    });
 });
}



