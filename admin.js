const getUser = () => {
    try { return JSON.parse(localStorage.getItem("currentUser")); }
    catch { return null; }
};

document.addEventListener("DOMContentLoaded", function () {
    const user = getUser();

    if (!user || user.role !== "admin") {
        alert("Admin access only");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("adminName").textContent = `👤 ${user.name}`;
    loadAllEvents();
});

async function loadAllEvents() {
    const list = document.getElementById("adminEventList");
    list.innerHTML = "<p style='color:#888;'>Loading...</p>";

    try {
        const data = await apiCall("/events/all");

        if (!data.events.length) {
            list.innerHTML = "<p style='color:#888;'>No events yet</p>";
            return;
        }

        list.innerHTML = "";

        data.events.forEach(event => {
            const isCompleted = event.status === "completed";

            list.innerHTML += `
                <div class="event-card-admin ${isCompleted ? 'completed' : ''}">
                    
                    <div class="event-card-top">
                        <strong>${event.title}</strong>
                        <span class="${isCompleted ? 'badge-completed' : 'badge-upcoming'}">
                            ${isCompleted ? '✓ Completed' : '● Upcoming'}
                        </span>
                    </div>

                    <div class="event-meta">
                        📅 ${event.date} &nbsp;|&nbsp; 📍 ${event.location}
                        &nbsp;|&nbsp; 👥 ${event.registrationCount}/${event.capacity}
                    </div>

                    <div class="event-actions">
                        <button class="btn-view" onclick="viewAttendees('${event.id}', '${event.title}')">
                            👁 View Attendees
                        </button>

                        ${!isCompleted ? `
                        <button class="btn-complete" onclick="markComplete('${event.id}')">
                            ✓ Mark Complete
                        </button>` : ""}

                        <button class="btn-delete" onclick="deleteEvent('${event.id}')">
                            🗑 Delete
                        </button>
                    </div>

                </div>
            `;
        });

    } catch (err) {
        list.innerHTML = `<p style="color:red">${err.message}</p>`;
    }
}
async function addEvent() {
    const title = eventName.value.trim();
    const date = eventDate.value;
    const location = eventLocation.value.trim();
    const imageUrl = eventImage.value.trim();

    if (!title || !date || !location) {
        alert("Fill all required fields");
        return;
    }

    try {
        await apiCall("/events", {
            method: "POST",
            body: JSON.stringify({ title, date, location, imageUrl, capacity: 100 })
        });

        alert("Event Added ✅");
        loadAllEvents();

    } catch (err) {
        alert(err.message);
    }
}

async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;

    try {
        await apiCall(`/events/${id}`, { method: "DELETE" });
        alert("Deleted ✅");
        loadAllEvents();
    } catch (err) {
        alert(err.message);
    }
}

async function markComplete(id) {
    try {
        await apiCall(`/events/${id}/complete`, { method: "PATCH" });
        alert("Marked Complete ✅");
        loadAllEvents();
    } catch (err) {
        alert(err.message);
    }
}

async function viewAttendees(eventId, eventTitle) {
    const panel = document.getElementById("attendeesPanel");
    panel.innerHTML = "<p style='color:#888;'>Loading...</p>";

    try {
        const data = await apiCall(`/admin/events/${eventId}/attendees`);

        if (!data.attendees.length) {
            panel.innerHTML = `
                <div class="attendee-placeholder">
                    <span>📭</span>
                    No registrations yet for<br><strong>"${eventTitle}"</strong>
                </div>`;
            return;
        }

        let html = `
            <div class="attendee-header">
                <strong>"${eventTitle}"</strong>
                <span class="attendee-count">${data.count} Registered</span>
            </div>
        `;

        data.attendees.forEach((a, i) => {
            html += `
                <div class="attendee-card">
                    <div class="att-name">
                        <span class="att-number">${i + 1}</span>
                        ${a.fullName || a.name || "N/A"}
                    </div>

                    <div class="att-grid">
                        <div class="att-item">🎓 Reg No: <span>${a.regNumber || "N/A"}</span></div>
                        <div class="att-item">📧 Email: <span>${a.email || "N/A"}</span></div>
                        <div class="att-item">📱 Mobile: <span>${a.mobile || "N/A"}</span></div>
                        <div class="att-item">👤 Gender: <span>${a.gender || "N/A"}</span></div>
                        <div class="att-item">🎯 Type: <span>${a.eventType || "N/A"}</span></div>
                        <div class="att-item">🤝 Participation: <span>${a.participationType || "N/A"}</span></div>
                        ${a.details ? `<div class="att-item" style="grid-column:1/-1;">📝 ${a.details}</div>` : ""}
                    </div>
                </div>
            `;
        });

        panel.innerHTML = html;

    } catch (err) {
        panel.innerHTML = `<p style="color:red">${err.message}</p>`;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}