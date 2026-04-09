const API_BASE = "http://localhost:5000/api";
let isVerified = false;

// ── REGISTER ──────────────────────────────────────────────────────────
async function handleRegister(event) {
    event.preventDefault();
    if (!isVerified) {
    alert("Please verify your email first!");
    return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = "student";

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        alert("Registration Successful ✅");
        window.location.href = "index.html";

    } catch (err) {
        alert("Server error. Please try again.");
        console.error(err);
    }
}

// ── LOGIN ─────────────────────────────────────────────────────────────
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed ❌");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (err) {
        alert("Server error. Make sure backend is running on port 5000.");
        console.error(err);
    }
}
async function sendOTP() {
    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Enter email first");
        return;
    }

    try {
        await fetch("http://localhost:5000/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        alert("OTP sent to your email 📧");

    } catch (err) {
        alert("Failed to send OTP");
    }
}
async function verifyOTP() {
    const email = document.getElementById("email").value.trim();
    const otp = document.getElementById("otpInput").value.trim();

    if (!otp) {
        alert("Enter OTP");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        if (!res.ok) throw new Error();

        isVerified = true;
        alert("Email verified ✅");

    } catch (err) {
        alert("Invalid OTP ❌");
    }
}
