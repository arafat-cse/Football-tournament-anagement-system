const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({host: '127.0.0.1', user: 'root', database: 'footbal_tournament'});
  const [rows] = await connection.execute('SELECT * FROM registrations ORDER BY id DESC LIMIT 5');
  console.log(rows);
  connection.end();
}
run().catch(console.error);
