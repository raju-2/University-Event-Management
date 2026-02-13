let events = JSON.parse(localStorage.getItem("events")) || [];

function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
}

function addEvent() {
    const name = document.getElementById("eventName").value;
    const date = document.getElementById("eventDate").value;
    const location = document.getElementById("eventLocation").value;
    const image = document.getElementById("eventImage").value || "https://via.placeholder.com/400x200";

    if (!name || !date || !location) {
        alert("Fill all fields");
        return;
    }

    events.push({ name, date, location, image });
    saveEvents();
    displayAdminEvents();
}

function deleteEvent(index) {
    events.splice(index, 1);
    saveEvents();
    displayAdminEvents();
}

function displayAdminEvents() {
    const list = document.getElementById("adminEventList");
    list.innerHTML = "";

    events.forEach((event, index) => {
        list.innerHTML += `
            <div class="admin-event-item">
                ${event.name}
                <button onclick="deleteEvent(${index})">Delete</button>
            </div>
        `;
    });
}

displayAdminEvents();
