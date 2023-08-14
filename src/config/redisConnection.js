const redis = require('redis');
const client = redis.createClient({
    port: 17151,
    auth_pass: process.env.AUTH_REDIS,
    host: 'redis-17151.c1.ap-southeast-1-1.ec2.cloud.redislabs.com',
    retry_strategy: function (options) {
        if (options.error && options.error.code == 'ECONNREFUSED') {
            //console.log('Redis connection to ' + host + ':' + port + ' failed,The server refused the connection');
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.max(options.attempt * 100, 3000);
    },
});
client.ping((err, pong) => {
    console.log(pong);
});
client.on('error', (err) => {
    console.log('Redis client error:: ', err);
    client.quit();
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('ready', () => {
    console.log('Redis is ready');
});

module.exports = client;
