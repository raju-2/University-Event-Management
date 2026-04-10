const express = require("express");
const router = express.Router();
const { runQuery } = require("../config/db");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
    try {
        const records = await runQuery(`
            MATCH (u:User) WHERE u.role = 'student'
            WITH count(u) as totalStudents
            MATCH (e:Event)
            WITH totalStudents, count(e) as totalEvents,
                 sum(CASE WHEN e.status = 'upcoming' THEN 1 ELSE 0 END) as upcomingEvents,
                 sum(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completedEvents
            OPTIONAL MATCH (:User)-[r:REGISTERED_FOR]->(:Event)
            RETURN totalStudents, totalEvents, upcomingEvents, completedEvents, count(r) as totalRegistrations
        `);
        const s = records[0];
        res.json({ stats: {
            totalStudents: s.get("totalStudents").toNumber(),
            totalEvents: s.get("totalEvents").toNumber(),
            upcomingEvents: s.get("upcomingEvents").toNumber(),
            completedEvents: s.get("completedEvents").toNumber(),
            totalRegistrations: s.get("totalRegistrations").toNumber(),
        }});
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch stats." });
    }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
    try {
        const records = await runQuery(`
            MATCH (u:User) WHERE u.role = 'student'
            OPTIONAL MATCH (u)-[r:REGISTERED_FOR]->(e:Event)
            RETURN u, count(r) as eventCount
            ORDER BY u.createdAt DESC
        `);
        const users = records.map(r => ({
            ...r.get("u").properties,
            password: undefined,
            eventCount: r.get("eventCount").toNumber(),
        }));
        res.json({ users });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users." });
    }
});

// ─── GET /api/admin/events/:id/attendees ──────────────────────────────────────
// Returns full form details for each attendee
router.get("/events/:id/attendees", async (req, res) => {
    try {
        const records = await runQuery(
            `MATCH (u:User)-[r:REGISTERED_FOR]->(e:Event {id: $id})
             RETURN 
                u.name as name,
                u.email as userEmail,
                r.fullName as fullName,
                r.regNumber as regNumber,
                r.email as email,
                r.mobile as mobile,
                r.gender as gender,
                r.eventType as eventType,
                r.participationType as participationType,
                r.details as details,
                r.registeredAt as registeredAt
             ORDER BY r.registeredAt ASC`,
            { id: req.params.id }
        );

        const attendees = records.map(record => ({
            name: record.get("fullName") || record.get("name"),
            regNumber: record.get("regNumber"),
            email: record.get("email") || record.get("userEmail"),
            mobile: record.get("mobile"),
            gender: record.get("gender"),
            eventType: record.get("eventType"),
            participationType: record.get("participationType"),
            details: record.get("details"),
            registeredAt: record.get("registeredAt"),
        }));

        res.json({ attendees, count: attendees.length });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch attendees." });
    }
});

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
router.delete("/users/:id", async (req, res) => {
    try {
        await runQuery(
            `MATCH (u:User {id: $id}) WHERE u.role = 'student'
             OPTIONAL MATCH (u)-[r:REGISTERED_FOR]->(:Event)
             DELETE r, u`,
            { id: req.params.id }
        );
        res.json({ message: "Student removed." });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete user." });
    }
});

router.get("/graph", async (req, res) => {
    try {
        const records = await runQuery(`
            MATCH (n)-[r]->(m)
            RETURN n, r, m LIMIT 50
        `);

        const nodesMap = new Map();
        const links = [];

        records.forEach(record => {
            const n = record.get("n");
            const m = record.get("m");
            const r = record.get("r");

            // ✅ Use your custom ID (IMPORTANT)
            const nId = n.properties.id;
            const mId = m.properties.id;

            // ✅ Add node N (avoid duplicates)
            if (!nodesMap.has(nId)) {
                nodesMap.set(nId, {
                    id: nId,
                    label: n.labels[0], // User / Event
                    name: n.properties.name,
                    title: n.properties.title
                });
            }

            // ✅ Add node M
            if (!nodesMap.has(mId)) {
                nodesMap.set(mId, {
                    id: mId,
                    label: m.labels[0],
                    name: m.properties.name,
                    title: m.properties.title
                });
            }

            // ✅ Add relationship
            links.push({
                source: nId,
                target: mId,
                type: r.type
            });
        });

        res.json({
            nodes: Array.from(nodesMap.values()),
            links
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
