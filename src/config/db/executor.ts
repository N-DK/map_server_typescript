import { Pool, QueryResult } from 'pg';
import connectToPostgres from '../db/connect';
import { OptionsType, QueryConditions } from '../../types';
import processGeometry from '../../modules/geometryProcessor';

let pool: Pool;

const initializeDB = async () => {
    pool = await connectToPostgres();
};

const query = async (
    tableName: string,
    queryObject: QueryConditions,
    options: OptionsType = {},
    callback: (err: Error | null, results?: QueryResult<any>[]) => void,
) => {
    try {
        const keys = Object.keys(queryObject);
        const values = Object.values(queryObject);

        const whereClause = keys.length
            ? `WHERE ${keys
                  .map((key, i) => `${key} = $${i + 1}`)
                  .join(' AND ')}`
            : '';
        const columns = options.columns ? options.columns.join(', ') : '*';
        const orderBy = options.orderBy ? `ORDER BY ${options.orderBy}` : '';
        const limit = options.limit ? `LIMIT ${options.limit}` : '';
        const offset = options.offset ? `OFFSET ${options.offset}` : '';
        const text = `SELECT ${columns} FROM ${tableName} ${whereClause} ${orderBy} ${limit} ${offset}`;
        const res = await pool.query(text, values);
        callback(null, res.rows);
    } catch (err: any) {
        console.log(err);
        callback(err);
    }
};

const insertOrUpdate = async (
    tableName: string,
    data: { [key: string]: any },
    queryObject: { [key: string]: any },
    callback: (err: Error | null, results?: QueryResult<any>[]) => void,
) => {
    try {
        const keys = Object.keys(data);
        const queryKeys = Object.keys(queryObject);
        if (data['way']) {
            data['way'] = await processGeometry(data['way'], pool, queryObject);
        }
        if (queryObject['way']) {
            const point = await processGeometry(
                queryObject['way'],
                pool,
                queryObject,
            );
            queryObject['way'] = point;
            queryKeys[queryKeys.indexOf('way')] = 'ST_Astext(way)';
        }
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const whereClause = queryKeys.length
            ? `WHERE ${queryKeys
                  .map((key, i) => `${key} = $${keys.length + i + 1}`)
                  .join(' AND ')}`
            : '';
        const queryValues = Object.values(queryObject);
        const values = Object.values(data);
        const queryText =
            queryKeys.length > 0
                ? `UPDATE ${tableName} SET ${setClause} ${whereClause} RETURNING *`
                : `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${keys
                      .map((_, i) => `$${i + 1}`)
                      .join(', ')}) RETURNING *`;
        const res = await pool.query(queryText, [...values, ...queryValues]);
        callback(null, res.rows);
    } catch (err: any) {
        console.error('Error:', err);
        callback(err);
    }
};

export { initializeDB, query, insertOrUpdate };
