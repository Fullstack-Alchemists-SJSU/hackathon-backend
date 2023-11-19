import { Redis, RedisOptions } from 'ioredis';

const redisOptions: RedisOptions = {
	port: 6379,
	host: 'localhost',
	keepAlive: 1,
};

const redis = new Redis(redisOptions);

export default redis;
