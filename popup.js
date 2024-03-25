let defaultorder = [
    // I don't know how field events work
    "4x800 Meter Relay",
    "100 Meter Hurdles",
    "100 Meter Dash",
    "4x200 Meter Relay",
    "1600 Meter Run",
    "4x100 Meter Relay",
    "400 Meter Dash",
    "300 Meter Hurdles",
    "800 Meter Run",
    "200 Meter Dash",
    "3200 Meter Run",
    "4x400 Meter Relay",
];

function addEventRow(event) {
    $("#sortable-events").append($('<li>'+event+'</li>'))
}

function buildPopup(eventlist) {
    console.log("set up popup")

    // start with the events in our default order
    defaultorder.forEach(function(event) {
        let idx = eventlist.indexOf(event)
        if(idx > -1) {
            addEventRow(event)
            eventlist.splice(idx,1)
        }
    })

    // put the rest of the events in
    eventlist.forEach(function(event) {
        addEventRow(event)
    })

    $('#sortbutton').click(async function() {
        let tabid = await getTabId()

        chrome.scripting.executeScript({
            target: {tabId: tabid},
            files: ['reformat.js']
        });

        eventorder = $.map($("#sortable-events li"), (el) => el.innerHTML);
        console.log(eventorder)

        let options = {
            'events': eventorder,
            'girls_first': true,
            'include_empty': true
        }

        // delay the message slightly
        setTimeout(() => chrome.tabs.sendMessage(tabid, {'events': eventorder}), 200);
    });
}

//console.log("add listener for messages")
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Received message from a content script: " 
        + sender.tab.url)
    
    if(request.events) {
        buildPopup(request.events)
    } else {
        // TODO indicate in popup that we don't operate on this page
        console.log("Nothing to do on this page")
    }
});

async function getTabId() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab.id
}

async function gather() {
    let tabid = await getTabId()

    chrome.scripting.executeScript({
        target: {tabId: tabid},
        files: ['gather.js']
    });
}

console.log("running gather script on page")
gather()

