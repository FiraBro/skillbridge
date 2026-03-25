const { Pool } = require('pg');

const pool = new Pool({ 
  host: 'localhost',
  port: 5432,
  database: 'skillbridge',
  user: 'skillbridge_user',
  password: 'StrongPassword123',
  ssl: false
});

console.log('Connecting to database...');

pool.query(
  "SELECT id, username, LENGTH(username) as len FROM profiles WHERE username LIKE $1",
  ['%jemal-firagos%']
).then(result => {
  console.log('=== Step 1: Username search ===');
  console.log('Found rows:', result.rows.length);
  console.log('Data:', JSON.stringify(result.rows, null, 2));
  
  return pool.query(
    "SELECT id, username FROM profiles WHERE LOWER(username) = LOWER($1)",
    ['jemal-firagos']
  );
}).then(result => {
  console.log('\n=== Step 2: Case insensitive search ===');
  console.log('Data:', JSON.stringify(result.rows, null, 2));
  
  return pool.query(
    `SELECT p.id, p.username, u.github_username as user_github 
     FROM profiles p 
     LEFT JOIN users u ON u.id = p.user_id 
     WHERE LOWER(TRIM(p.username)) = LOWER(TRIM($1))`,
    ['jemal-firagos']
  );
}).then(result => {
  console.log('\n=== Step 3: Full join query ===');
  console.log('Data:', JSON.stringify(result.rows, null, 2));
  
  return pool.query("SELECT id, username, LENGTH(username) as len FROM profiles");
}).then(result => {
  console.log('\n=== Step 4: All profiles ===');
  console.log('Data:', JSON.stringify(result.rows, null, 2));
  
  pool.end();
}).catch(err => {
  console.error('ERROR:', err.message);
  console.error('Stack:', err.stack);
  pool.end();
});
