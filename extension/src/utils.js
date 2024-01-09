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

const sendWaitlistRequest = (courseRow) => {
    console.log("Updated user's waitlist preferences.")
}