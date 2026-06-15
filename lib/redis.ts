import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

const client: RedisClientType =
  globalForRedis.redis ??
  createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT ?? 6379),
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