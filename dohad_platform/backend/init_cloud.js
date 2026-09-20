require('dotenv').config({ path: __dirname + '/.env' });
const mysql = require('mysql2/promise');

async function initAll() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Creating login details table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`login details\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255)
            );
        `);
        console.log('Login table created successfully!');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}
initAll();
