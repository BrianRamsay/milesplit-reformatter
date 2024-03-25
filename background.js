/*
 chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {"message": "clicked_browser_action"});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting === "hello")
      sendResponse({farewell: "goodbye"});
});


chrome.action.onClicked.addListener((tab) => {
    console.log('extension opened')
    var btn = document.getElementByID("sortbutton");
    btn.addEventListener('click', function(e) { console.log("sort click"); });

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
});
*/
