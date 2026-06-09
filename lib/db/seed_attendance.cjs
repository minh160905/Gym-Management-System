const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_AybSP4JgNG8o@ep-rough-unit-aqdr0a6f.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";
const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("Connected to Neon DB. Querying members and classes...");

    // Get all members
    const membersRes = await client.query("SELECT id, first_name, last_name, status FROM members;");
    const members = membersRes.rows;
    console.log(`Found ${members.length} members`);

    if (members.length === 0) {
      console.log("No members found. Cannot insert attendance.");
      return;
    }

    // Get all classes
    const classesRes = await client.query("SELECT id, name FROM classes LIMIT 3;");
    const classes = classesRes.rows;
    console.log(`Found ${classes.length} classes`);

    // Today is June 9, 2026. Let's insert checkins for today!
    // We want checkins around 8:00 AM, 9:30 AM, 10:15 AM, 11:00 AM, 12:45 PM, 1:15 PM today
    const checkinTimes = [
      "2026-06-09T08:05:00.000Z",
      "2026-06-09T09:32:00.000Z",
      "2026-06-09T10:15:00.000Z",
      "2026-06-09T11:02:00.000Z",
      "2026-06-09T12:45:00.000Z",
      "2026-06-09T13:15:00.000Z",
      "2026-06-09T13:40:00.000Z"
    ];

    // Clear old attendance records to have a clean list
    await client.query("DELETE FROM attendance;");
    console.log("Cleared old attendance records.");

    // Insert new attendance records
    for (let i = 0; i < Math.min(members.length, checkinTimes.length); i++) {
      const member = members[i];
      const checkinTime = checkinTimes[i];
      const classId = classes.length > 0 ? classes[i % classes.length].id : null;
      
      // Some checkouts (e.g. earlier checkins checked out, later ones haven't checked out yet)
      let checkoutTime = null;
      if (i < 3) {
        // checked out after 90 minutes
        const checkoutDate = new Date(checkinTime);
        checkoutDate.setMinutes(checkoutDate.getMinutes() + 90);
        checkoutTime = checkoutDate.toISOString();
      }

      await client.query(
        "INSERT INTO attendance (member_id, class_id, checked_in_at, checked_out_at) VALUES ($1, $2, $3, $4);",
        [member.id, classId, checkinTime, checkoutTime]
      );
      console.log(`Inserted attendance for ${member.first_name} ${member.last_name} at ${checkinTime}`);
    }

    console.log("Seeding attendance completed successfully!");
  } catch (err) {
    console.error("Error seeding attendance:", err);
  } finally {
    await client.end();
  }
}

run();
