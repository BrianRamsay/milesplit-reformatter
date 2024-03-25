console.log("reformatting")

function reformat_page(options) {
    // TODO reformat the page!
}

// listen for our reformat details
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Received message from extension")
    
    if(request.events) {
        reformat_page(request)

    } else {
        console.log("Unknown response from extension!")
        console.log(request)
    }
});
