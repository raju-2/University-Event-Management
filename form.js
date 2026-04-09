document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("token");

    if (!token || !user) {
        alert("Login required");
        window.location.href = "login.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const eventName = params.get("event");

    if (eventName) {
        document.getElementById("eventTitle").textContent =
            "Register for " + decodeURIComponent(eventName);
    }

    document.getElementById("fullName").value = user.name || "";
    document.getElementById("emailAddr").value = user.email || "";
});

async function submitForm(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");

    const formData = {
        fullName: fullName.value.trim(),
        regNumber: regNumber.value.trim(),
        email: emailAddr.value.trim(),
        mobile: mobile.value.trim(),
        gender: gender.value,
        eventType: eventType.value,
        participationType: participationType.value,
        details: details.value.trim()
    };

    try {
        await apiCall(`/events/${eventId}/register`, {
            method: "POST",
            body: JSON.stringify(formData)
        });

        alert("Registration Successful 🎉");
        window.location.href = "index.html";

    } catch (err) {
        alert(err.message);
    }
}