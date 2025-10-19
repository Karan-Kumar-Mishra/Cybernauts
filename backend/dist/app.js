"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const redis_1 = require("./config/redis");
const pool_1 = __importDefault(require("./config/pool"));
const cluster_1 = __importDefault(require("./cluster"));
const app = (0, express_1.default)();
(0, cluster_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', userRoutes_1.default);
app.get('/health', async (req, res) => {
    try {
        await pool_1.default.query('SELECT 1');
        const dbStatus = 'connected';
        const redisStatus = redis_1.redisClient.isReady() ? 'connected' : 'disconnected';
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            redis: redisStatus
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'Service Unavailable',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            redis: redis_1.redisClient.isReady() ? 'connected' : 'disconnected'
        });
    }
});
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await redis_1.redisClient.disconnect();
    await pool_1.default.end();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await redis_1.redisClient.disconnect();
    await pool_1.default.end();
    process.exit(0);
});
exports.default = app;
