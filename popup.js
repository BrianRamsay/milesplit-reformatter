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
var teams_from_page = null;
var reformat_sent = false;

function addSortRow(table,item) {
    var id = "i" + Math.floor(Math.random() * Date.now())
    $("#sortable-"+table).append($(`<li>
            <img class="handle" src="images/handle.svg" alt="grab to sort list" />
            <input id="${id}" type='checkbox' checked />
            <label for="${id}">${item}</label>
        </li>`))
}

function getSortedRows(table) {
    return $("#sortable-"+table+" li").filter((idx,li) => $(li).children('input:checkbox').is(':checked'))
                                      .map((idx,li) => li.innerText.trim()).toArray();
}

/*
 *
 */
function create_page_config() {
    return {
        'events': getSortedRows('events'),
        'teams': getSortedRows('teams'),
        'include_empty': $("#include-empty-box").is(":checked"),
        'multi_col': $("#multi-col-box").is(":checked")
    }
}

function buildPopup() {
    let eventlist = events_from_page
    let teamlist = teams_from_page

    // start with the events in our default order
    defaultorder.forEach(function(event) {
        let idx = eventlist.indexOf(event)
        if(idx > -1) {
            addSortRow('events',event)
            eventlist.splice(idx,1)
        }
    })

    // put the rest of the events in
    eventlist.forEach(function(event) {
        addSortRow('events',event)
    })

    // put the teams in
    teamlist.forEach(function(team) {
        addSortRow('teams',team)
    })
    $("ul").sortable({handle: '.handle',placeholder: 'placeholder'})

    // Add action to the reformat button
    $('#reformat').click(async function() {
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
    if(request.events && request.events.length) {
        events_from_page = request.events
        teams_from_page = request.teams

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

gather()

