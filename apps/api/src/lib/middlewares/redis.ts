import { RedisClient } from "bun";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "@/lib/types";

let redisInstance: RedisClient | null = null;

async function getRedisClient(): Promise<RedisClient> {
  if (redisInstance) {
    return redisInstance;
  }

  try {
    const client = new RedisClient("", {
      connectionTimeout: ,
    });
    await client.connect();

    redisInstance = client;

    return client;
  } catch (error) {
    console.error("Redis connection error:", error);
    throw new Error(`Redis connection failed: ${(error as Error).message}`);
  }
}

export const redisMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    try {
      const redis = await getRedisClient();
      c.set("redis", redis);

      await next();
    } catch (error) {
      c.var.logger.fatal({ error }, "Failed to initialize Redis");
      throw error;
    }
  }
);

export function closeRedis() {
  if (redisInstance) {
    redisInstance.close();
    redisInstance = null;
  }
}
