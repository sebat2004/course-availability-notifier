export const insertButtons = (courseList) => {
    courseList.childNodes.forEach((child, idx) => {
        // Returns if course has already been modified (prevents infinite loop)
        if (child.classList.contains('insertedStatus')) {
            return;
        }

        child.classList.add("insertedStatus");
        if (idx > 0) {
            const waitlistButton = document.createElement("button");
            waitlistButton.innerText = "Testing!";
            child.appendChild(waitlistButton);
        }
    });
}