console.log("reformatting")

var g_entries = null
var g_options = null

function build_entry_list() {
    if(g_entries)
        return g_entries

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

    g_entries = events
}

function build_header(event,groups) {
    let html = '<tr>'
    let group_html = []
    groups.forEach(group => {
        let event_entries = g_entries[event][group]
        let pl = event_entries.length == 1 ? 'y' : 'ies' 
        let cols = groups.length == 1 ? 4 : 2

        group_html.push(`<th colspan="${cols}">${group} ${event}: ${event_entries.length} Entr${pl}</th>`)
    });
    html += group_html.join("<td></td>") // if two columns, add spacer
    html += '</tr>'

    return html;
}

function build_entries(event,groups) {
	/******** single-column *********/
    if(groups.length == 1) {
    	let html = ''
        let trailer = event.includes("Relay") ? '' : '<td colspan="2"></td>' 
        groups.forEach(group => {
            let event_entries = g_entries[event][group]
            event_entries.forEach(e => {
                html += `<tr><td>${e.join("</td><td>")}</td>${trailer}</tr>`
            });
        });

    	return html
	}

	/******** multi-column *********/
	let maxentries = Math.max(...groups.map(g => g_entries[event][g].length))
	// create 2D array
	let rows = Array.from({length:maxentries},
				e=>Array.from({length:groups.length}, y=>['','']))
	groups.forEach((group,groupidx) => {
		let event_entries = g_entries[event][group]

		// split relay entries into pairs
		if(event.includes("Relay")) {
			event_entries = []
			g_entries[event][group].forEach(entry => {
				var x = 0
				while(typeof entry[x] !== 'undefined') {
					event_entries.push(entry.slice(x,x+2))
					x += 2
				}
			});
			maxentries = Math.max(maxentries,event_entries.length)
			while(rows.length < maxentries) {
				rows.push(Array.from({length:groups.length}, y=>['','']))
			}
		}
		// put entries into 2D array
		for(var row=0; row < maxentries; row++) {
			if(row < event_entries.length) {
				rows[row][groupidx] = event_entries[row]
			}
		}
	});

    let html = ''
	rows.forEach(row => {
		html += '<tr>'
		html += row.map(group => `<td>${group.join('</td><td>')}</td>`).join('<td class="spacer"></td>');
		html += '</tr>'
	});

	return html
}

function reformat_page() {
    // get all entries before clearing the page
    $('table').last().remove();
    build_entry_list()

    meet_text = $('h1').first().text()
    team_text = $('h2').first().text()

    // rebuild page
    let body = $('body')
    body.html(`
        <h2>${team_text}</h2>
        <h1>${meet_text}</h1>
        <p>Track events are in proper running order. Field events are not.</p>
        <table><tbody></tbody></table>
    `);
    $('table').css("width", g_options.double_col ? "100%" : "75%")


    let tbl = $('table tbody').first();

    // TODO short-term solution. make more generic (for HS + mixed MS/HS)
    let grouporder = ["MS Girls", "MS Boys"];
    if(!g_options.girls_first) {
        grouporder.reverse()
    }

    g_options.events.forEach(function(event) {
        if(!(event in g_entries)) {
            console.log("Unknown event: " + event)
            return
        }

        var html = ''
        if(g_options.double_col) {
            html += build_header(event,grouporder)
            html += build_entries(event,grouporder)
        } else {
            grouporder.forEach(group => {
                html += build_header(event,[group])
                html += build_entries(event,[group])
            });
        }
        html += '<tr></tr>'
        tbl.append($(html))
    });

    //console.log(entries)
}

// listen for our reformat details
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Received message from extension")
    
    if(request.events) {
        console.log(request.events)
        g_options = request
        reformat_page()

    } else {
        console.log("Unknown response from extension!")
        console.log(request)
    }
});
