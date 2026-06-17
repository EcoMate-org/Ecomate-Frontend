import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

const rawHost = process.env.REDIS_HOST || '127.0.0.1';
// Split hostname from port if host string includes it (e.g. "host:port")
const host = rawHost.split(':')[0];
const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : (rawHost.split(':')[1] ? Number(rawHost.split(':')[1]) : 6379);

const client: RedisClientType =
  globalForRedis.redis ??
  createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWD,
    socket: {
      host,
      port,
    },
  });

client.on("error", (err: Error) => {
  console.error("Redis Client Error:", err);
});

if (!client.isOpen) {
  client.connect().catch((err) => {
    console.error("Redis connection failed:", err);
  });
}

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = client;
}

export default client;