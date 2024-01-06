import { insertButtons  } from "./utils";

// IMPORTANT: How OSU calls course API (found on line 8218 of source code)

// Example request: 
//  $.ajax({
//     url: apiURL,
//     type: 'POST',
//     processData: false,
//     contentType: 'application/json',
//     data: encodeURIComponent(JSON.stringify(postData)),
//     dataType: 'json'
//  });

// apiURL is always https://classes.oregonstate.edu/api/?page=fose&route=search&keyword=cs
// postData is always { group: group, key: key, srcdb: srcdb, matched: matched }
// group, key, srcdb, and matched are all contained in data attributes on the clickable HTML element.


MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// Callback function executes with any change to DOM
var observer = new MutationObserver((mutations) => {
    const courseList = document.querySelector("div.course-sections");

    if (!courseList) {
        return;
    }

    // Add waitlist notifier buttons on each course section
    mutations.forEach((mutation, observer) => {
        insertButtons(courseList);
    });
});

// Start observing DOM
observer.observe(document, {
    subtree: true,
    attributes: true
});