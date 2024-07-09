import * as redis from 'redis';
import { HOSTNAME, REDIS_PORT } from '../config/config';

const redisClient = redis.createClient({
    socket: {
        host: HOSTNAME,
        port: Number(REDIS_PORT),
    },
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', () => {});

export default redisClient;
