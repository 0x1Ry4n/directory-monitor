import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { logger } from "./logger";

export class Redis {
  public static redisClient: RedisClientType;
  public static isReady: boolean;

  static async getCache(): Promise<RedisClientType> {
    if (!this.isReady) {
        this.redisClient = createClient({
          url: process.env.REDIS_URI
        })

        this.redisClient.on('error', err => logger.error(`Redis Error: ${err}`))
        this.redisClient.on('connect', () => logger.info('Redis connected'))
        this.redisClient.on('reconnecting', () => logger.info('Redis reconnecting'))
        this.redisClient.on('ready', () => {
          this.isReady = true
          logger.info('Redis ready!')
        })
        
        await this.redisClient.connect()
      }
      return this.redisClient
  }
 
  static async disconnectRedis() {
      await this.redisClient.disconnect();
  }
}

