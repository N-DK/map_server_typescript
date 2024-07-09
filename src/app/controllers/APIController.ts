import { NextFunction, Request, Response } from 'express';
import interpreter from '../models/Interpreter';
import parseQuery from '../../modules/parseQuery';
import {
    cacheKey,
    checkQueryValidity,
    formatOutput,
    handleError,
} from '../../utils';
import { cacheData } from '../../middleware/cache';

class APIController {
    // [GET] /
    index(req: Request, res: Response, next: NextFunction) {
        res.send('Hello World!');
    }

    // [GET] interpreter/?data=<type>["key"="value"](south, west, north, east)
    getInterpreter(req: Request, res: Response, next: NextFunction) {
        const data = req?.query?.data;
        if (!data) return res.json({ result: 0 });
        const query = parseQuery(data as string);

        const error = checkQueryValidity(query);
        if (error) {
            return handleError(res, error);
        }

        interpreter.get(query, (err, results) => {
            if (err || !results) {
                return res.json({ result: 0, error: err });
            } else {
                if (results?.length > 50000) {
                    return res.json({
                        version: 0.1,
                        osm3s: {
                            timestamp_osm_base: new Date().toISOString(),
                            copyright:
                                'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
                        },
                        elements: [],
                        remark: 'runtime error: Query run out of memory using about 2048 MB of RAM.',
                    });
                }
                results = results.map((res) => ({
                    ...res,
                    type: query.elementType,
                }));
                cacheData(
                    cacheKey('interpreter', query),
                    formatOutput(results),
                    3600,
                );
                return res.json({
                    version: 0.1,
                    osm3s: {
                        timestamp_osm_base: new Date().toISOString(),
                        copyright:
                            'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
                    },
                    elements: formatOutput(results),
                });
            }
        });
    }

    // [POST] interpreter/create
    createInterpreter(req: Request, res: Response, next: NextFunction) {
        const data = req?.body;
        if (!data) return res.json({ result: 0 });

        interpreter.create(data, (err, results) => {
            if (err) {
                return res.json({ result: 0, error: err });
            } else {
                return res.json({ result: 1, data: results });
            }
        });
    }

    // [PUT] interpreter/update
    updateInterpreter(req: Request, res: Response, next: NextFunction) {
        const data = req?.body;
        if (!data) return res.json({ result: 0 });

        interpreter.update(data, (err, results) => {
            if (err) {
                return res.json({ result: 0, error: err });
            } else {
                return res.json({ result: 1, data: results });
            }
        });
    }
}

export default new APIController();
