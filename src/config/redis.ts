import { createClient, RedisClientType } from "redis";
import { config } from "./env.js";

let client: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!client) {
    client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis connection failed after 10 retries");
            return new Error("Redis connection failed");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    client.on("connect", () => {
      console.log("Redis connected successfully");
    });

    await client.connect();
  }

  return client;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (client) {
    await client.quit();
    client = null;
    console.log("Redis connection closed");
  }
};

process.on("SIGINT", async () => {
  await closeRedisConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeRedisConnection();
  process.exit(0);
});
