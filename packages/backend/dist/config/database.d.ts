import { Pool } from 'pg';
import { Db } from 'mongodb';
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
declare class DatabaseManager {
    private postgresPool;
    private mongoClient;
    private mongoDb;
    private redisClient;
    initialize(config: DatabaseConfig): Promise<void>;
    getPostgresPool(): Pool;
    getMongoDb(): Db;
    getRedisClient(): Redis.RedisClientType;
    close(): Promise<void>;
    healthCheck(): Promise<{
        postgres: boolean;
        mongodb: boolean;
        redis: boolean;
    }>;
}
export declare const dbManager: DatabaseManager;
export default dbManager;
//# sourceMappingURL=database.d.ts.map