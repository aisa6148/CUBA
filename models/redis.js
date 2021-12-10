const redis = require('redis');
const bluebird = require('bluebird');
const redisConfig = {
    auth_pass: '1YR85EXPSdRFGCBE39zG8iypVHEY7X54JAzCaGQrGCo=',
    tls: {
        servername: 'CUBA-Redis.redis.cache.windows.net',
    },
}

class Redis {
    client;
    constructor() {
        bluebird.promisifyAll(redis.RedisClient.prototype);
        bluebird.promisifyAll(redis.Multi.prototype);
        this.client = redis.createClient(6380, redisConfig.tls.servername, redisConfig);
        this.client.on('error', function (error) {
            console.error({ location: 'redis initialization', error: error });
        });
    }
    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (error, reply) => error ? reject(error) : resolve(reply));
        });
    }
    set(key, value, mode, duration) {
        return this.client.set(key, value, mode, duration);
    }
}

module.exports.Redis = Redis;


