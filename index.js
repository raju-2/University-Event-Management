const getToken = () => localStorage.getItem("token");
const getUser = () => {
    try { return JSON.parse(localStorage.getItem("currentUser")); }
    catch { return null; }
};

document.addEventListener("DOMContentLoaded", async function () {
    const user = getUser();
    const token = getToken();

    if (!token || !user) {
        window.location.href = "login.html";
        return;
    }

    updateNavbar(user);
    loadEvents();
});

function updateNavbar(user) {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    const greeting = document.getElementById("userGreeting");
    greeting.style.display = "inline-block";
    greeting.textContent = `👤 ${user.name.split(" ")[0]}`;

    if (user.role === "admin") {
        document.getElementById("adminBtn").style.display = "inline-block";
    }
}

async function loadEvents() {
    const container = document.getElementById("eventList");
    container.innerHTML = "<p>Loading events...</p>";

    try {
        const data = await apiCall("/events");

        if (!data.events || data.events.length === 0) {
            container.innerHTML = "<p>No events available</p>";
            return;
        }

        container.innerHTML = "";

        data.events.forEach((event, i) => {
            const imgSrc = event.imageUrl || `img/event${(i % 6) + 1}.jpg`;

            container.innerHTML += `
                <div class="card">
                    <img src="${imgSrc}" class="event-img">
                    <h4>${event.title}</h4>
                    <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                    <p>Location: ${event.location}</p>
                    <p style="font-size:13px;color:#888;">👥 ${event.registrationCount}/${event.capacity}</p>
                    <button onclick="goToForm('${event.id}', '${event.title}')">Register</button>
                </div>
            `;
        });

    } catch (err) {
        container.innerHTML = `<p style="color:red">${err.message}</p>`;
    }
}

function goToForm(id, title) {
    window.location.href = `form.html?eventId=${id}&event=${encodeURIComponent(title)}`;
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function scrollToEvents() {
    document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
}