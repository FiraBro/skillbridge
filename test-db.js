require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function test() {
  try {
    console.log('DB URL:', process.env.DATABASE_URL);
    
    // Step 1: Check for hidden characters
    console.log('\n=== Step 1: Check username length ===');
    let result = await pool.query(
      "SELECT id, username, LENGTH(username) as len FROM profiles WHERE username LIKE $1",
      ['%jemal-firagos%']
    );
    console.log('Result:', JSON.stringify(result.rows, null, 2));
    
    // Step 2: Check case sensitivity
    console.log('\n=== Step 2: Case insensitive search ===');
    result = await pool.query(
      "SELECT id, username FROM profiles WHERE LOWER(username) = LOWER($1)",
      ['jemal-firagos']
    );
    console.log('Result:', JSON.stringify(result.rows, null, 2));
    
    // Step 3: Test the full getProfileByUsername query
    console.log('\n=== Step 3: Full profile query ===');
    result = await pool.query(
      `
      SELECT
        p.id, p.user_id, p.username, p.full_name, p.bio, p.location, p.reputation_score, p.joined_at, p.updated_at,
        COALESCE(p.github_username, gs.github_username, u.github_username) AS github_username
      FROM profiles p
      LEFT JOIN users u ON u.id = p.user_id
      LEFT JOIN github_stats gs ON gs.profile_id = p.id
      WHERE LOWER(TRIM(p.username)) = LOWER(TRIM($1))
      `,
      ['jemal-firagos']
    );
    console.log('Full query result:', JSON.stringify(result.rows, null, 2));
    
    // Step 4: Check all profiles
    console.log('\n=== Step 4: All profiles ===');
    result = await pool.query("SELECT id, username, LENGTH(username) as len FROM profiles");
    console.log('All profiles:', JSON.stringify(result.rows, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

test();
