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
            } else {
                console.log("Can't find the expected details in " + event_h.innerHTML)
            }

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
    // TODO need to figure out how to remove text (or just nuke and rebuild the whole page)

    // remove payment info
    while($('h2').last().next().length) {
        $('h2').last().next().remove()
    }
    $('h2').last().remove()

    $('table').css("width", "75%")

    var entries = build_entry_list()

    $('table tr').remove()
    $('h3').remove()

    let tbl = $($('table tbody')[0]);

    // TODO short-term solution. make more generic (for HS + mixed MS/HS)
    let grouporder = ["MS Girls", "MS Boys"];

    options.events.forEach(function(eventname) {
        if(eventname in entries) {
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

        } else {
            console.log("Unknown eventname: " + eventname)
        }
    });

    console.log(entries)
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
