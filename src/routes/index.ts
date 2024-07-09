import { Express } from 'express';
import apiRouter from './api';

const route = (app: Express) => {
    app.use('/api/v1', apiRouter);
};

export default route;
