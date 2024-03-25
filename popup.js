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

function addEventRow(event, list) {
    //const li = document.createElement("li")
    //li.textContent = event

    //const input = document.createElement("input")

    $(list).append($('<li>'+event+'</li>'))
}

function buildPopup(eventlist) {
    console.log("set up popup")
    let list = document.getElementById("sortable-events")

    // start with the events in our default order
    defaultorder.forEach(function(event) {
        let idx = eventlist.indexOf(event)
        if(idx > -1) {
            addEventRow(event, list)
            eventlist.splice(idx,1)
        }
    })

    // put the rest of the events in
    eventlist.forEach(function(event) {
        addEventRow(event, list)
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
        chrome.tabs.sendMessage(tabid, {'events': eventorder});
    });
}

//console.log("add listener for messages")
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    
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

/*
function test() {
    console.log("WHY???")
    document.innerHTML = '';
}

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  console.log('test')

  // Execute content script to change html
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: test
  });

  // Execute content script to reorder table rows
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: reorderTableRows
  });
});

// Function to reorder table rows
function reorderTableRows() {
  console.log("reordering")
  alert("wtf")

  // Find the first table on the page
  const table = document.querySelector('table');
  if (table) {
    // Find all rows in the table except the header row
    const rows = Array.from(table.querySelectorAll('tr')).slice(1);

    // Sort rows alphabetically based on the content of the first cell (you can modify this based on your needs)
    rows.sort((a, b) => {
      const textA = a.cells[0].innerText.trim().toLowerCase();
      const textB = b.cells[0].innerText.trim().toLowerCase();
      return textA.localeCompare(textB);
    });

    // Remove existing rows from the table
    rows.forEach(row => row.remove());

    // Add sorted rows back to the table
    rows.forEach(row => table.appendChild(row));
  }
}
*/

