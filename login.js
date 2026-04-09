let isVerified = true; // 🔥 always true (OTP removed)

// ── EMAIL VALIDATION ─────────────────────────────────
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── REGISTER ─────────────────────────────────────────
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = "student";

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    // ✅ Email format check
    if (!isValidEmail(email)) {
        alert("Enter a valid email address");
        return;
    }

    // ✅ Optional restriction (you can remove if not needed)
    if (!email.endsWith("@gmail.com")) {
        alert("Use a valid Gmail account");
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

// ── LOGIN ────────────────────────────────────────────
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
        alert("Server error. Please try again.");
        console.error(err);
    }
}

// 🔥 OTP FUNCTIONS DISABLED (no longer used)
async function sendOTP() {
    alert("OTP disabled for this version");
}

async function verifyOTP() {
    alert("OTP disabled for this version");
}