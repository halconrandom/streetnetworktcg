const { Client } = require('pg');
require('dotenv').config();
const c = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
c.connect()
    .then(() => c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'sg_tcg_users'"))
    .then(r => {
        console.log('Columns:', r.rows.map(x => x.column_name).join(', '));
        return c.end();
    })
    .catch(e => {
        console.error('Error:', e.message);
        process.exit(1);
    });
