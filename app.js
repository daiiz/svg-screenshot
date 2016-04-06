var main = function () {
}

var sendChromeMsg = (json, callback) => {
     chrome.runtime.sendMessage(json, callback);
}

window.addEventListener("load", main, false);
