function scrollToEvents() {
    document.getElementById("events").scrollIntoView({
        behavior: "smooth"
    });
}

function registerEvent(eventName) {
    alert("Successfully Registered for " + eventName + " 🎉");
}


// Load events from localStorage
let events = JSON.parse(localStorage.getItem("events")) || [];

// If no events exist, add default ones
if (events.length === 0) {
    events = [
        {
            name: "Tech Fest 2026",
            date: "2026-03-25",
            location: "Sports Triangle",
            image: "img/event1.jpg"
        },
        {
            name: "AI Workshop",
            date: "2026-04-05",
            location: "Lab 204",
            image: "img/event2.jpg"
        },
        {
            name: "Sports Event",
            date: "2026-04-20",
            location: "Main Ground",
            image: "img/event3.jpg"
        },
        {
            name: "Flash Mob",
            date: "2026-05-02",
            location: "Rock Plaza",
            image: "img/event4.jpg"
        },
        {
            name: "Hackathon 2026",
            date: "2026-05-15",
            location: "Innovation Lab",
            image: "img/event5.jpg"
        },
        {
            name: "Ted-Talks",
            date: "2026-06-01",
            location: "Auditorium",
            image: "img/event6.jpg"
        }
    ];

    localStorage.setItem("events", JSON.stringify(events));
}


// Display Events
function displayEvents() {
    const container = document.getElementById("eventList");
    container.innerHTML = "";

    events.forEach(event => {
        container.innerHTML += `
        <div class="card">
            <img src="${event.image || 'https://via.placeholder.com/400x200'}" class="event-img">
            <h4>${event.name}</h4>
            <p>Date: ${event.date}</p>
            <p>Location: ${event.location}</p>
            <button onclick="location.href='form.html?event=${event.name}'">
                Register
            </button>
        </div>
        `;
    });
}

displayEvents();


displayEvents();
