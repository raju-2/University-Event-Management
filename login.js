let isVerified = true; // OTP removed
const REGISTER_LOGIN_PREFILL_KEY = "registerLoginPrefill";

// ── EMAIL VALIDATION ─────────────────────────────────
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAllowedEmail(email) {
    return (
        email.endsWith("@gmail.com") ||
        email.endsWith("@vitapstudent.ac.in")
    );
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

    // ✅ Validation
    if (!isValidEmail(email) || !isAllowedEmail(email)) {
        alert("Use a valid Gmail or VIT-AP student email");
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

        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        sessionStorage.setItem(
            REGISTER_LOGIN_PREFILL_KEY,
            JSON.stringify({ email, password })
        );

        alert("Registration successful. Please login to continue.");
        window.location.href = "login.html";

    } catch (err) {
        alert("Server error. Please try again.");
        console.error(err);
    }
}

function prefillLoginAfterRegister() {
    const loginForm = document.querySelector("form[onsubmit*='handleLogin']");
    if (!loginForm) return;

    const savedCredentials = sessionStorage.getItem(REGISTER_LOGIN_PREFILL_KEY);
    if (!savedCredentials) return;

    try {
        const { email, password } = JSON.parse(savedCredentials);
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (emailInput && email) emailInput.value = email;
        if (passwordInput && password) passwordInput.value = password;
    } catch (err) {
        console.error("Unable to prefill login credentials", err);
    } finally {
        sessionStorage.removeItem(REGISTER_LOGIN_PREFILL_KEY);
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

// OTP disabled
async function sendOTP() {
    alert("OTP disabled");
}

async function verifyOTP() {
    alert("OTP disabled");
}

document.addEventListener("DOMContentLoaded", prefillLoginAfterRegister);
