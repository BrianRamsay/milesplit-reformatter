// parse page to get list of events

// get table header rows
var headers = document.getElementsByTagName('th')

// parse out just the name of the event
var eventlist = Array.from(headers).map((i) => {
    let m = i.innerHTML.match(/(MS|HS) (Boys|Girls) (.*):/)
    return (m && m.length > 3) ? m[3] : false

  // remove bad headers
}).filter((i) => i)
  // remove duplicates
  .filter((v,i,arr) => arr.indexOf(v) === i)

//console.log(eventlist)

// send events back to extension
if(eventlist.length) {
    chrome.runtime.sendMessage({events: eventlist});
}
