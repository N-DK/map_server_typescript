import { QueryResult } from 'pg';
import { insert, query, update } from '../../config/db/executor';
import { QueryConditions, QueryType } from '../../types';
import { TYPE } from '../../constant';

interface Interpreter {
    get: (
        query: QueryType,
        callback: (err: Error | null, results?: QueryResult<any>[]) => void,
    ) => void;
    create: (
        query: { elementType: string; data: any },
        callback: (err: Error | null, results?: QueryResult<any>[]) => void,
    ) => void;
    update: (
        query: { elementType: string; data: any; conditions: QueryConditions },
        callback: (err: Error | null, results?: QueryResult<any>[]) => void,
    ) => void;
}

const interpreter: Interpreter = {
    get: (__query__, callback) => {
        return query(
            `public.planet_osm_${__query__.elementType}`,
            __query__.conditions,
            {
                columns:
                    __query__.elementType === 'way'
                        ? [
                              'osm_id',
                              'way',
                              'highway',
                              'name',
                              'minspeed',
                              'maxspeed',
                              'ref',
                          ]
                        : undefined,
            },
            (err: Error | null, results?: QueryResult<any>[]) => {
                if (err) return callback(err);
                return callback(null, results);
            },
        );
    },
    create: (query, callback) => {
        return insert(
            `public.planet_osm_nodes`,
            query.data,
            (err: Error | null, results?: QueryResult<any>[]) => {
                if (err) return callback(err);
                return callback(null, results);
            },
        );
    },
    update: (query, callback) => {
        return update(
            query.data,
            query.conditions,
            (err: Error | null, results?: QueryResult<any>[]) => {
                if (err) return callback(err);
                return callback(null, results);
            },
        );
    },
};

export default interpreter;
