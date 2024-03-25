// parse page to get list of events

// get table header rows
var headers = document.getElementsByTagName('th')

// parse out just the name of the event
var eventlist = Array.from(headers).map((i) => {
    let m = i.innerHTML.match(/(MS|HS) (Boys|Girls) (.*):/)
    if(m && m.length > 3) {
        return m[3]
    } else {
        return false
    }

// remove bad headers, then remove duplicates
}).filter((i) => i)
  .filter((v,i,arr) => arr.indexOf(v) === i)

//console.log(eventlist)

// send events back to extension
chrome.runtime.sendMessage({events: eventlist});
