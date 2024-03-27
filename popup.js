let defaultorder = [
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
    // I don't know how field events work
];

var events_from_page = null;
var reformat_sent = false;

function addEventRow(event) {
    $("#sortable-events").append($('<li>'+event+'</li>'))
}

function create_page_config() {
    eventorder = $.map($("#sortable-events li"), (el) => el.innerHTML);
    console.log(eventorder)

    let options = {
        'events': eventorder,
        'girls_first': $("#girls-first-box").is(":checked"),
        'include_empty': $("#include-empty-box").is(":checked"),
        'double_col': $("#double-col-box").is(":checked")
    }

    return options
}

function buildPopup() {
    console.log("set up popup")
    let eventlist = events_from_page

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

    // Add action to the sort button
    $('#sortbutton').click(async function() {
        let tabid = await getTabId()

        if(!reformat_sent) {
            chrome.scripting.executeScript({
                target: {tabId: tabid},
                files: ['reformat.js']
            });
            reformat_sent = true;
        }

        // send our configuration to the page
        // delay the message slightly
        setTimeout(() => chrome.tabs.sendMessage(tabid, create_page_config()), 200);
    });
}

// Listen for the events coming from our page
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.events) {
        events_from_page = request.events
        console.log(events_from_page)
        buildPopup()
        $('#no-milesplit').hide()
        $('#yes-milesplit').show()
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

