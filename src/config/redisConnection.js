const redis = require('redis');
const client = redis.createClient({
    port: 17151,
    auth_pass: process.env.AUTH_REDIS,
    host: 'redis-17151.c1.ap-southeast-1-1.ec2.cloud.redislabs.com',
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
