import { NextFunction, Request, Response } from 'express';
import { cacheKey } from '../utils';
import parseQuery from '../modules/parseQuery';
import redisClient from '../services/redis';

async function cache(req: Request, res: Response, next: NextFunction) {
    const key = cacheKey('interpreter', parseQuery(req?.query?.data as string));
    if (!redisClient.isReady) {
        return next();
    }
    try {
        const data = await redisClient.get(key);
        if (data !== null) {
            return res.json({
                version: 0.1,
                osm3s: {
                    timestamp_osm_base: new Date().toISOString(),
                    copyright:
                        'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
                },
                element: JSON.parse(data),
                data_from: 'cache',
            });
        } else {
            next();
        }
    } catch (error) {
        console.log('Redis cache error:', error);
        next();
    }
}

function cacheData(
    cacheKey: string,
    data: any,
    expirationInSeconds: number = 3600,
) {
    if (redisClient.isReady) {
        redisClient.setEx(cacheKey, expirationInSeconds, JSON.stringify(data));
    }
}

export { cache, cacheData };
