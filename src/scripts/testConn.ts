import pool from "../config/database";

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");

    // Test query
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database time:", result.rows[0].now);

    client.release();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
