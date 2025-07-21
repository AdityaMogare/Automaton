import { Pool, PoolConfig } from 'pg';
import { MongoClient, Db } from 'mongodb';
import Redis from 'redis';

export interface DatabaseConfig {
  postgres: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
  };
  mongodb: {
    uri: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

class DatabaseManager {
  private postgresPool: Pool | null = null;
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private redisClient: Redis.RedisClientType | null = null;

  async initialize(config: DatabaseConfig): Promise<void> {
    try {
      // Initialize PostgreSQL
      const postgresConfig: PoolConfig = {
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        ssl: config.postgres.ssl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      this.postgresPool = new Pool(postgresConfig);

      // Test PostgreSQL connection
      const client = await this.postgresPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL connected successfully');

      // Initialize MongoDB
      this.mongoClient = new MongoClient(config.mongodb.uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db(config.mongodb.database);
      console.log('✅ MongoDB connected successfully');

      // Initialize Redis
      this.redisClient = Redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        password: config.redis.password,
      });

      await this.redisClient.connect();
      console.log('✅ Redis connected successfully');

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  getPostgresPool(): Pool {
    if (!this.postgresPool) {
      throw new Error('PostgreSQL pool not initialized');
    }
    return this.postgresPool;
  }

  getMongoDb(): Db {
    if (!this.mongoDb) {
      throw new Error('MongoDB not initialized');
    }
    return this.mongoDb;
  }

  getRedisClient(): Redis.RedisClientType {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }
    return this.redisClient;
  }

  async close(): Promise<void> {
    try {
      if (this.postgresPool) {
        await this.postgresPool.end();
        console.log('✅ PostgreSQL connection closed');
      }

      if (this.mongoClient) {
        await this.mongoClient.close();
        console.log('✅ MongoDB connection closed');
      }

      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }

  async healthCheck(): Promise<{
    postgres: boolean;
    mongodb: boolean;
    redis: boolean;
  }> {
    const health = {
      postgres: false,
      mongodb: false,
      redis: false,
    };

    try {
      // Check PostgreSQL
      if (this.postgresPool) {
        const client = await this.postgresPool.connect();
        await client.query('SELECT 1');
        client.release();
        health.postgres = true;
      }
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
    }

    try {
      // Check MongoDB
      if (this.mongoDb) {
        await this.mongoDb.admin().ping();
        health.mongodb = true;
      }
    } catch (error) {
      console.error('MongoDB health check failed:', error);
    }

    try {
      // Check Redis
      if (this.redisClient) {
        await this.redisClient.ping();
        health.redis = true;
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    return health;
  }
}

export const dbManager = new DatabaseManager();
export default dbManager; 