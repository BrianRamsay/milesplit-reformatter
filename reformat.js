console.log("reformatting")

function build_entry_list() {
    let events = {}
    var current_group = ''
    var current_event = ''
    $('table tr').each(function(idx,el) {
        var event_h = $(el).find('th')
        if(event_h.length) {
            // get the group and event out of the header
            let text = event_h[0].innerHTML
            let m = text.match(/((MS|HS) (Boys|Girls)) (.*):/)
            // If we found group and event
            if(m && m.length > 4) {
                //console.log(`Creating ${m[1]} in ${m[4]}`)
                current_group =  m[1]
                current_event =  m[4]
                if(!(current_event in events)) {
                    events[current_event] = {}
                }
                if(!(current_group in events[current_event])) {
                    events[current_event][current_group] = []
                }

            // No group and event found
            } else {
                console.log("Can't find the expected details in " + event_h.innerHTML)
            }

        // Record an entry row
        } else {
            var cells = $(el).find('td')
            if(cells.length) {
                //console.log(`Adding ${cells[0].innerHTML} to ${current_event}`)
                events[current_event][current_group].push(cells.toArray().map(c => c.innerHTML))
            } else {
                console.log("Found an empty table row")
            }
        }
    });

    return events
}

function reformat_page(options) {
    // get all entries before clearing the page
    $('table').last().remove();
    var entries = build_entry_list()

    meet_text = $('h1').first().text()
    team_text = $('h2').first().text()

    // rebuild page
    let body = $('body')
    body.html(`
        <h2>${team_text}</h2>
        <h2>${meet_text}</h2>
        <p>Track events are in proper running order. Field events are not.</p>
        <table><tbody></tbody></table>
    `);
    $('table').css("width", "75%")


    let tbl = $('table tbody').first();

    // TODO short-term solution. make more generic (for HS + mixed MS/HS)
    let grouporder = ["MS Girls", "MS Boys"];

    options.events.forEach(function(eventname) {
        if(!(eventname in entries)) {
            console.log("Unknown eventname: " + eventname)
            return
        }

        grouporder.forEach(group => {
            let event_entries = entries[eventname][group]
            let trailer = eventname.includes("Relay") ? '' : '<td colspan="2"></td>' 
            let pl = event_entries.length == 1 ? 'y' : 'ies' 
            tbl.append($(`<tr><th colspan="4">${group} ${eventname}: ${event_entries.length} Entr${pl}</th></tr>`))
            event_entries.forEach(e => {
                tbl.append($(`<tr><td>${e.join("</td><td>")}</td>${trailer}</tr>`))
            });
        });
        tbl.append($('<tr></tr>'))
    });

    //console.log(entries)
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
