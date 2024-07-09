import { POSTGRES_CONNECT_URI } from '../config';

import { Pool } from 'pg';

const pgConfig = {
    connectionString: POSTGRES_CONNECT_URI,
};

const pool = new Pool(pgConfig);

const connectToPostgres = async () => {
    try {
        await pool.connect();
        console.log('Connected to PostgreSQL');
        return pool;
    } catch (err) {
        console.log('Failed to connect to the database. Error:', err);
        process.exit(1);
    }
};

export default connectToPostgres;
