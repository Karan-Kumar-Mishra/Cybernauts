"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RedisClient {
    constructor() {
        this.isConnected = false;
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });
        this.client.on('disconnect', () => {
            console.log('Redis Client Disconnected');
            this.isConnected = false;
        });
    }
    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }
    async set(key, value, expireInSeconds) {
        try {
            const stringValue = JSON.stringify(value);
            if (expireInSeconds) {
                await this.client.setEx(key, expireInSeconds, stringValue);
            }
            else {
                await this.client.set(key, stringValue);
            }
        }
        catch (error) {
            console.error('Redis set error:', error);
            throw error;
        }
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Redis get error:', error);
            throw error;
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            console.error('Redis delete error:', error);
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis exists error:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.disconnect();
        }
    }
    isReady() {
        return this.isConnected;
    }
}
exports.redisClient = new RedisClient();
