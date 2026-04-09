// api.js
const API_BASE = "http://localhost:5000/api"; // change after deployment

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