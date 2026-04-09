// ============================================
// SESSION MANAGER (IMPROVED VERSION)
// Auto logout after inactivity
// ============================================

// ⏳ Set session timeout (30 minutes)
const SESSION_TIMEOUT = 20 * 60 * 1000; // 5 minutes
const WARNING_TIME   = 60 * 1000;       // warn 1 min before
const SESSION_KEY    = "lastActivity";

let logoutTimer;
let warningTimer;
let warningBox;

// ── Start / reset session ──────────────────
function resetSession() {
    localStorage.setItem(SESSION_KEY, Date.now());

    clearTimeout(logoutTimer);
    clearTimeout(warningTimer);
    hideWarning();

    // Show warning before expiry
    warningTimer = setTimeout(showWarning, SESSION_TIMEOUT - WARNING_TIME);

    // Auto logout
    logoutTimer = setTimeout(autoLogout, SESSION_TIMEOUT);
}

// ── Auto logout ────────────────────────────
function autoLogout() {
    // ❌ DO NOT clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem(SESSION_KEY);

    showLogoutMessage();
}

// ── Logout popup ───────────────────────────
function showLogoutMessage() {
    hideWarning();

    const overlay = document.createElement("div");
    overlay.id = "session-expired-overlay";
    overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.7);
        display:flex; align-items:center; justify-content:center;
        z-index:99999; font-family:'Segoe UI',sans-serif;
    `;

    overlay.innerHTML = `
        <div style="background:white; border-radius:16px; padding:40px 36px;
                    text-align:center; max-width:360px; width:90%;
                    box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <div style="font-size:48px; margin-bottom:16px;">⏱️</div>
            <h3 style="color:#0f172a; font-size:20px; margin-bottom:10px;">
                Session Expired
            </h3>
            <p style="color:#64748b; font-size:14px; margin-bottom:24px; line-height:1.6;">
                You've been inactive.<br>Please login again to continue.
            </p>
            <button onclick="window.location.href='login.html'"
                style="background:#2563eb; color:white; border:none;
                       padding:12px 28px; border-radius:8px; font-size:15px;
                       font-weight:600; cursor:pointer; width:100%;">
                Login Again
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

// ── Warning before logout ──────────────────
function showWarning() {
    if (warningBox) return;

    let secondsLeft = 60;

    warningBox = document.createElement("div");
    warningBox.id = "session-warning";
    warningBox.style.cssText = `
        position:fixed; bottom:24px; right:24px;
        background:#1e293b; color:white;
        border-radius:12px; padding:16px 20px;
        box-shadow:0 8px 32px rgba(0,0,0,0.3);
        z-index:99998; font-family:'Segoe UI',sans-serif;
        min-width:280px; border-left:4px solid #f59e0b;
    `;

    warningBox.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:12px;">
            <span style="font-size:22px;">⚠️</span>
            <div style="flex:1;">
                <div style="font-weight:700; font-size:14px; margin-bottom:4px;">
                    Session expiring soon
                </div>
                <div style="color:#94a3b8; font-size:13px; margin-bottom:12px;">
                    You'll be logged out in 
                    <strong id="session-countdown" style="color:#f59e0b;">60</strong> seconds
                </div>
                <button onclick="resetSession()"
                    style="background:#2563eb; color:white; border:none;
                           padding:7px 16px; border-radius:6px; font-size:13px;
                           font-weight:600; cursor:pointer;">
                    Stay Logged In
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(warningBox);

    const countdownEl = document.getElementById("session-countdown");

    const countInterval = setInterval(() => {
        secondsLeft--;
        if (countdownEl) countdownEl.textContent = secondsLeft;

        if (secondsLeft <= 0) clearInterval(countInterval);
    }, 1000);
}

// ── Hide warning ───────────────────────────
function hideWarning() {
    if (warningBox) {
        warningBox.remove();
        warningBox = null;
    }
}

// ── Track user activity ────────────────────
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

ACTIVITY_EVENTS.forEach(event => {
    document.addEventListener(event, resetSession, { passive: true });
});

// ── Init on page load ──────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    // If not logged in → do nothing
    if (!token) return;

    const lastActivity = parseInt(localStorage.getItem(SESSION_KEY) || "0");

    if (lastActivity) {
        const elapsed = Date.now() - lastActivity;

        if (elapsed > SESSION_TIMEOUT) {
            // Session expired
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            localStorage.removeItem(SESSION_KEY);

            showLogoutMessage();
            return;
        }
    }

    // Start session
    resetSession();
});