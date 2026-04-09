// api.js
const API_BASE = "https://university-event-management-08c3.onrender.com";

async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        ...options
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    } catch (err) {
        console.error("API Error:", err.message);
        throw err;
    }
}