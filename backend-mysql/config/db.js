import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from './env.js';

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function execQuery(sql, params) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

export async function runTransaction(queries, params) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const results = [];
        for (let i = 0; i < queries.length; i++) {
            const [rows] = await connection.execute(queries[i], params[i]);
            results.push(rows);
        }

        await connection.commit();
        return results;
        
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error executing transaction:', error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}