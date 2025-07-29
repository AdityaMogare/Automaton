"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = void 0;
const pg_1 = require("pg");
const mongodb_1 = require("mongodb");
const redis_1 = __importDefault(require("redis"));
class DatabaseManager {
    constructor() {
        this.postgresPool = null;
        this.mongoClient = null;
        this.mongoDb = null;
        this.redisClient = null;
    }
    async initialize(config) {
        try {
            const postgresConfig = {
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
            this.postgresPool = new pg_1.Pool(postgresConfig);
            const client = await this.postgresPool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('✅ PostgreSQL connected successfully');
            this.mongoClient = new mongodb_1.MongoClient(config.mongodb.uri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            await this.mongoClient.connect();
            this.mongoDb = this.mongoClient.db(config.mongodb.database);
            console.log('✅ MongoDB connected successfully');
            this.redisClient = redis_1.default.createClient({
                socket: {
                    host: config.redis.host,
                    port: config.redis.port,
                },
                password: config.redis.password,
            });
            await this.redisClient.connect();
            console.log('✅ Redis connected successfully');
        }
        catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }
    getPostgresPool() {
        if (!this.postgresPool) {
            throw new Error('PostgreSQL pool not initialized');
        }
        return this.postgresPool;
    }
    getMongoDb() {
        if (!this.mongoDb) {
            throw new Error('MongoDB not initialized');
        }
        return this.mongoDb;
    }
    getRedisClient() {
        if (!this.redisClient) {
            throw new Error('Redis client not initialized');
        }
        return this.redisClient;
    }
    async close() {
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
        }
        catch (error) {
            console.error('❌ Error closing database connections:', error);
        }
    }
    async healthCheck() {
        const health = {
            postgres: false,
            mongodb: false,
            redis: false,
        };
        try {
            if (this.postgresPool) {
                const client = await this.postgresPool.connect();
                await client.query('SELECT 1');
                client.release();
                health.postgres = true;
            }
        }
        catch (error) {
            console.error('PostgreSQL health check failed:', error);
        }
        try {
            if (this.mongoDb) {
                await this.mongoDb.admin().ping();
                health.mongodb = true;
            }
        }
        catch (error) {
            console.error('MongoDB health check failed:', error);
        }
        try {
            if (this.redisClient) {
                await this.redisClient.ping();
                health.redis = true;
            }
        }
        catch (error) {
            console.error('Redis health check failed:', error);
        }
        return health;
    }
}
exports.dbManager = new DatabaseManager();
exports.default = exports.dbManager;
//# sourceMappingURL=database.js.map