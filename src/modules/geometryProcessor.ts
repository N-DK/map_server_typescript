import { Pool } from 'pg';
import proj4 from 'proj4';
import wkx from 'wkx';
import { Point, QueryConditions } from '../types';

const processGeometryArray = (geomArray: Point[]) => {
    const transformedPoints = geomArray.map(processPoint);
    return `LINESTRING(${transformedPoints
        .map((point) => `${point.lon} ${point.lat}`)
        .join(', ')})`;
};

const processPoint = (point: Point) => {
    const lonLat = proj4('EPSG:4326', 'EPSG:3857', [point.lon, point.lat]);
    return { lon: lonLat[0], lat: lonLat[1] };
};

const processSinglePoint = async (
    point: Point,
    pool: Pool,
    queryObject: QueryConditions,
) => {
    const [lon, lat] = [point.lon, point.lat];
    const lonLat = proj4('EPSG:4326', 'EPSG:3857', [lon, lat]);
    const geometry = `POINT(${lonLat[0]} ${lonLat[1]})`;

    const selectWaysQuery = `
        SELECT osm_id, way, highway, name, ST_Distance(
            ST_Transform(way, 4326),
            ST_SetSRID(ST_MakePoint($1, $2), 4326)
        ) AS distance
        FROM public.planet_osm_way
        WHERE ST_DWithin(
            ST_Transform(way, 4326),
            ST_SetSRID(ST_MakePoint($1, $2), 4326),
            0.0001
        ) AND highway IS NOT NULL AND name IS NOT NULL
        ORDER BY distance
        LIMIT 3;        
    `;

    const [resWays, resNode] = await Promise.all([
        pool.query(selectWaysQuery, [lon, lat]),
        pool.query('SELECT way FROM public.planet_osm_node WHERE osm_id = $1', [
            queryObject['osm_id'],
        ]),
    ]);

    const relatedWays = resWays.rows;
    const nodeCoords: any =
        resNode.rows.length > 0
            ? (
                  wkx.Geometry.parse(
                      Buffer.from(resNode.rows[0].way, 'hex'),
                  ).toGeoJSON() as any
              ).coordinates
            : null;

    for (const way of relatedWays) {
        const geom: any = wkx.Geometry.parse(
            Buffer.from(way.way, 'hex'),
        ).toGeoJSON();
        if (nodeCoords) {
            geom.coordinates = geom.coordinates.map((coord: any) =>
                coord[0].toFixed(7) === nodeCoords[0].toFixed(7) &&
                coord[1].toFixed(7) === nodeCoords[1].toFixed(7)
                    ? [lonLat[0], lonLat[1]]
                    : coord,
            );
        } else if (Object.keys(queryObject).length === 0) {
            geom.coordinates.push([lonLat[0], lonLat[1]]);
        }

        const newLineWayWKT = wkx.Geometry.parseGeoJSON(geom).toWkt();
        const queryUpdate = `
            UPDATE public.planet_osm_way 
            SET way = $1 
            WHERE osm_id = $2 
            RETURNING *
        `;
        await pool.query(queryUpdate, [newLineWayWKT, way.osm_id]);
    }

    return geometry;
};

const processGeometry = async (
    geom: Point | Point[],
    pool: Pool,
    queryObject: QueryConditions,
) => {
    let geometry;
    if (Array.isArray(geom)) {
        geometry = processGeometryArray(geom);
    } else {
        geometry = await processSinglePoint(geom, pool, queryObject);
    }
    return wkx.Geometry.parse(geometry).toWkt();
};

export default processGeometry;
