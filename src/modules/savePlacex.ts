import { Pool } from 'pg';
import { QueryConditions } from '../types';

const savePlacex = async (
    pool: Pool,
    type: string,
    lat: number,
    lon: number,
    tags: QueryConditions,
    osm_id: number,
    isUpdate: boolean = false,
) => {
    try {
        const queryFindClassAndType = `
        WITH point AS (SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326) AS geom)
        SELECT p.class, p.type, p.place_id, ST_Distance(p.centroid, point.geom) AS distance, name
        FROM placex p, point WHERE name IS NOT NULL
        ORDER BY p.centroid <-> point.geom 
        LIMIT 1;`;

        const resQueryFindClassAndType = await pool.query(
            queryFindClassAndType,
            [lon, lat],
        );

        const extratags = tags.extratags
            ? Object.keys(tags.extratags)
                  .map((key) => `"${key}"=>"${tags.extratags[key]}"`)
                  .join(', ')
            : null;

        const name = tags.name
            ? Object.keys(tags.name)
                  .map((key) => `"${key}"=>"${tags.name[key]}"`)
                  .join(', ')
            : null;

        const queryText = !isUpdate
            ? `
            INSERT INTO placex (osm_type, osm_id, class, type, name, admin_level, indexed_status, geometry, extratags)
            VALUES ($1, $2, $3, $4, $5, 15, 0, ST_SetSRID(ST_GeomFromText('POINT(${lon} ${lat})'), 4326), $6) RETURNING *;`
            : `UPDATE placex SET osm_type = $1, osm_id = $2, class = $3, type = $4, name = $5,
            admin_level = 15, centroid = ST_SetSRID(ST_GeomFromText('POINT(${lon} ${lat})'), 4326),
            geometry = ST_SetSRID(ST_GeomFromText('POINT(${lon} ${lat})'), 4326),
            extratags = $6,
            indexed_status = 0 WHERE osm_id = $2 RETURNING *;`;

        const resQueryText = await pool.query(queryText, [
            type,
            osm_id,
            resQueryFindClassAndType.rows[0].class,
            resQueryFindClassAndType.rows[0].type,
            name,
            extratags,
        ]);

        const result = await pool.query(
            `UPDATE placex SET indexed_status = 0 WHERE place_id = ${resQueryText.rows[0].place_id}  RETURNING *;`,
        );

        return result;
    } catch (error) {
        console.log(error);
    }
};

export default savePlacex;
