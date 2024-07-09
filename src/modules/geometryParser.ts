import proj4, { InterfaceCoordinates } from 'proj4';
import wkx from 'wkx';

proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

const parseGeometry = (wkbString: string) => {
    const geom: any = wkx.Geometry.parse(
        Buffer.from(wkbString, 'hex'),
    ).toGeoJSON();
    if (geom.type === 'Point') {
        const [longitude, latitude] = proj4(
            'EPSG:3857',
            'EPSG:4326',
            geom.coordinates,
        );
        return {
            coordinates: [
                {
                    lat: Number(latitude.toFixed(7)),
                    lon: Number(longitude.toFixed(7)),
                },
            ],
        };
    }

    const coordinates = geom.coordinates.map((coord: any) => {
        const [longitude, latitude] = proj4('EPSG:3857', 'EPSG:4326', coord);
        return {
            lat: Number(latitude.toFixed(7)),
            lon: Number(longitude.toFixed(7)),
        };
    });

    const bounds = {
        minlat: Math.min(...coordinates.map((coord: any) => coord.lat)),
        minlon: Math.min(...coordinates.map((coord: any) => coord.lon)),
        maxlat: Math.max(...coordinates.map((coord: any) => coord.lat)),
        maxlon: Math.max(...coordinates.map((coord: any) => coord.lon)),
    };

    return { coordinates, bounds };
};

export default parseGeometry;
