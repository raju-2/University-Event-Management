const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 min
  }
);

// Verify connection on startup
const verifyConnection = async () => {
  try {
    await driver.verifyConnectivity();
    console.log("✅ Connected to Neo4j successfully");
  } catch (error) {
    console.error("❌ Neo4j connection failed:", error.message);
    process.exit(1);
  }
};

// Helper: run a query and return records
const runQuery = async (cypher, params = {}) => {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
};

// Initialize constraints and indexes (run once on startup)
const initDatabase = async () => {
  const session = driver.session();
  try {
    // Unique constraint on User email
    await session.run(
      `CREATE CONSTRAINT user_email_unique IF NOT EXISTS
       FOR (u:User) REQUIRE u.email IS UNIQUE`
    );

    // Unique constraint on Event id
    await session.run(
      `CREATE CONSTRAINT event_id_unique IF NOT EXISTS
       FOR (e:Event) REQUIRE e.id IS UNIQUE`
    );

    console.log("✅ Neo4j constraints and indexes initialized");
  } catch (err) {
    console.error("⚠️  DB init error (may already exist):", err.message);
  } finally {
    await session.close();
  }
};

module.exports = { driver, runQuery, verifyConnection, initDatabase };
