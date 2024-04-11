// parse page to get list of events

// get table header rows

// parse out just the name of the event
var eventlist = []
var teamlist = []

$('th').each((idx,h) => {
    let text = h.innerHTML

    //hax
    text = text.replace("Girls 4X200", "MS Girls 4x200 Meter Relay")
    text = text.replace("Boys 4x200", "MS Boys 4x200 Meter Relay")

    if(!(text.includes("MS") || text.includes("HS"))) {
        text = "MS " + text
    }
    let m = text.match(/((MS|HS) (Boys|Girls)) (.*):/)
    if (m && m.length > 4) {
        eventlist.push(m[4])
        teamlist.push(m[1])
    }
});

// send non-duplicates back to extension
if(eventlist.length) {
    chrome.runtime.sendMessage({
        events: eventlist.filter((v,i,arr) => arr.indexOf(v) === i),
        teams: teamlist.filter((v,i,arr) => arr.indexOf(v) === i)
    });
}
