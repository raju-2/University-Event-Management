const express = require("express");
const router = express.Router();
const { runQuery } = require("../config/db");
const { protect, adminOnly } = require("../middleware/auth");

// ─── GET /api/events ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const records = await runQuery(
            `MATCH (e:Event)
             WHERE e.status <> 'completed' OR e.status IS NULL
             OPTIONAL MATCH (:User)-[r:REGISTERED_FOR]->(e)
             RETURN e, count(r) as registrationCount
             ORDER BY e.date ASC`
        );
        const events = records.map(record => ({
            ...record.get("e").properties,
            registrationCount: record.get("registrationCount").toNumber(),
        }));
        res.json({ events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch events." });
    }
});

// ─── GET /api/events/all ──────────────────────────────────────────────────────
router.get("/all", protect, adminOnly, async (req, res) => {
    try {
        const records = await runQuery(
            `MATCH (e:Event)
             OPTIONAL MATCH (:User)-[r:REGISTERED_FOR]->(e)
             RETURN e, count(r) as registrationCount
             ORDER BY e.date ASC`
        );
        const events = records.map(record => ({
            ...record.get("e").properties,
            registrationCount: record.get("registrationCount").toNumber(),
        }));
        res.json({ events });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch events." });
    }
});

// ─── GET /api/events/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const records = await runQuery(
            `MATCH (e:Event {id: $id}) RETURN e`,
            { id: req.params.id }
        );
        if (records.length === 0) return res.status(404).json({ message: "Event not found." });
        res.json({ event: records[0].get("e").properties });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch event." });
    }
});

// ─── POST /api/events ─────────────────────────────────────────────────────────
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const { title, description, date, location, imageUrl, capacity } = req.body;
        if (!title || !date || !location)
            return res.status(400).json({ message: "Title, date and location are required." });

        const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const records = await runQuery(
            `CREATE (e:Event {
                id: $id, title: $title, description: $description,
                date: $date, location: $location, imageUrl: $imageUrl,
                capacity: $capacity, status: 'upcoming',
                createdBy: $createdBy, createdAt: datetime()
            }) RETURN e`,
            {
                id: eventId, title,
                description: description || "",
                date, location,
                imageUrl: imageUrl || "",
                capacity: capacity ? parseInt(capacity) : 100,
                createdBy: req.user.id,
            }
        );
        res.status(201).json({ message: "Event created successfully!", event: records[0].get("e").properties });
    } catch (err) {
        res.status(500).json({ message: "Failed to create event." });
    }
});

// ─── PUT /api/events/:id ──────────────────────────────────────────────────────
router.put("/:id", protect, adminOnly, async (req, res) => {
    try {
        const { title, description, date, location, imageUrl, capacity, status } = req.body;
        const records = await runQuery(
            `MATCH (e:Event {id: $id})
             SET e.title = COALESCE($title, e.title),
                 e.description = COALESCE($description, e.description),
                 e.date = COALESCE($date, e.date),
                 e.location = COALESCE($location, e.location),
                 e.imageUrl = COALESCE($imageUrl, e.imageUrl),
                 e.capacity = COALESCE($capacity, e.capacity),
                 e.status = COALESCE($status, e.status),
                 e.updatedAt = datetime()
             RETURN e`,
            { id: req.params.id, title: title||null, description: description||null,
              date: date||null, location: location||null, imageUrl: imageUrl||null,
              capacity: capacity ? parseInt(capacity) : null, status: status||null }
        );
        if (records.length === 0) return res.status(404).json({ message: "Event not found." });
        res.json({ message: "Event updated!", event: records[0].get("e").properties });
    } catch (err) {
        res.status(500).json({ message: "Failed to update event." });
    }
});

// ─── PATCH /api/events/:id/complete ──────────────────────────────────────────
router.patch("/:id/complete", protect, adminOnly, async (req, res) => {
    try {
        const records = await runQuery(
            `MATCH (e:Event {id: $id})
             SET e.status = 'completed', e.updatedAt = datetime()
             RETURN e`,
            { id: req.params.id }
        );
        if (records.length === 0) return res.status(404).json({ message: "Event not found." });
        res.json({ message: "Event marked as completed.", event: records[0].get("e").properties });
    } catch (err) {
        res.status(500).json({ message: "Failed to update status." });
    }
});

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        await runQuery(
            `MATCH (e:Event {id: $id})
             OPTIONAL MATCH ()-[r]->(e)
             DELETE r, e`,
            { id: req.params.id }
        );
        res.json({ message: "Event deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete event." });
    }
});

// ─── POST /api/events/:id/register ───────────────────────────────────────────
// Full form registration - saves all form details to Neo4j
router.post("/:id/register", protect, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Form details from the registration form
        const {
            fullName, regNumber, email, mobile,
            gender, eventType, participationType, details
        } = req.body;

        // Check event exists
        const eventCheck = await runQuery(
            `MATCH (e:Event {id: $eventId}) RETURN e`,
            { eventId }
        );
        if (eventCheck.length === 0)
            return res.status(404).json({ message: "Event not found." });

        const event = eventCheck[0].get("e").properties;
        if (event.status === "completed")
            return res.status(400).json({ message: "Cannot register for a completed event." });

        // Check capacity
        const countResult = await runQuery(
            `MATCH (:User)-[r:REGISTERED_FOR]->(e:Event {id: $eventId})
             RETURN count(r) as count`,
            { eventId }
        );
        const currentCount = countResult[0].get("count").toNumber();
        if (event.capacity && currentCount >= parseInt(event.capacity))
            return res.status(400).json({ message: "Event is fully booked." });

        // Check if already registered
        const alreadyRegistered = await runQuery(
            `MATCH (u:User {id: $userId})-[r:REGISTERED_FOR]->(e:Event {id: $eventId})
             RETURN r`,
            { userId, eventId }
        );
        if (alreadyRegistered.length > 0)
            return res.status(409).json({ message: "You are already registered for this event." });

        // Save registration with full form details in the relationship
        await runQuery(
            `MATCH (u:User {id: $userId}), (e:Event {id: $eventId})
             CREATE (u)-[:REGISTERED_FOR {
                 registeredAt: datetime(),
                 fullName: $fullName,
                 regNumber: $regNumber,
                 email: $email,
                 mobile: $mobile,
                 gender: $gender,
                 eventType: $eventType,
                 participationType: $participationType,
                 details: $details
             }]->(e)`,
            {
                userId, eventId,
                fullName: fullName || req.user.name,
                regNumber: regNumber || "",
                email: email || req.user.email,
                mobile: mobile || "",
                gender: gender || "",
                eventType: eventType || "",
                participationType: participationType || "",
                details: details || ""
            }
        );

        res.status(201).json({ message: `Successfully registered for ${event.title}!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to register for event." });
    }
});

// ─── DELETE /api/events/:id/register ─────────────────────────────────────────
router.delete("/:id/register", protect, async (req, res) => {
    try {
        await runQuery(
            `MATCH (u:User {id: $userId})-[r:REGISTERED_FOR]->(e:Event {id: $eventId})
             DELETE r`,
            { userId: req.user.id, eventId: req.params.id }
        );
        res.json({ message: "Registration cancelled." });
    } catch (err) {
        res.status(500).json({ message: "Failed to cancel registration." });
    }
});

module.exports = router;
