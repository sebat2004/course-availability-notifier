export const insertButtons = (courseList) => {
    courseList.childNodes.forEach((courseRow, idx) => {
        // Returns if course has already been modified (prevents infinite loop)
        if (courseRow.classList.contains('insertedStatus')) {
            return;
        }

        if (courseRow.classList.contains("course-section--viewing")) {
            courseRow.style.pointerEvents = "auto";
        }

        courseRow.classList.add("insertedStatus");
        if (idx > 0 && courseFull(courseRow)) {
            const waitlistButton = createWaitlistButton();
            courseRow.appendChild(waitlistButton);
        }
    });
}

const courseFull = (courseRow) => {
    const enrollCap = courseRow.childNodes[5].childNodes[1].textContent;
    const enrollAmount = courseRow.childNodes[6].childNodes[1].textContent;
    return enrollAmount === enrollCap;
}

const createWaitlistButton = () => {
    const button = document.createElement('button');
    button.style.width = "125px";
    button.style.height = "55px";
    button.style.padding = "0.5rem"
    button.innerText = "Add to Waitlist Notifier";
    button.onclick = sendWaitlistRequest;

    return button;
}

const sendWaitlistRequest = (event) => {
    // Send request to server to add course to waitlist
    const courseRow = event.target.parentNode;
    const courseInfo = getCourseInfo(courseRow);

    fetch('http://localhost:3000/api/waitlists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseInfo)
    })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

const getCourseInfo = (courseRow) => {
    const courseInfo = {
        crn: courseRow.childNodes[0].childNodes[2].textContent.trim(),
        srcdb: courseRow.getAttribute('data-srcdb'),
        group: courseRow.getAttribute('data-group'),
        matched: courseRow.getAttribute('data-matched'),
        requestor: "seba" // TODO: Force user to login and get username from chrome.storage
    }
    return courseInfo;
}