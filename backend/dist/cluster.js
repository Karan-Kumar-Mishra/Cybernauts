"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const numCPUs = os_1.default.cpus().length;
dotenv_1.default.config();
function startCluster() {
    if (cluster_1.default.isPrimary) {
        for (let i = 0; i < Math.min(numCPUs, 4); i++) {
            cluster_1.default.fork();
        }
        cluster_1.default.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
            cluster_1.default.fork();
        });
    }
    else {
        const initializeWorker = async () => {
            try {
                await (0, database_1.initializeDatabase)();
                await redis_1.redisClient.connect();
                const PORT = process.env.PORT || 5000;
                app_1.default.listen(PORT, () => {
                    console.log(`Worker ${process.pid} started on port ${PORT}`);
                });
            }
            catch (error) {
                console.error(`Worker ${process.pid} failed to start:`, error);
                process.exit(1);
            }
        };
        // initializeWorker();
    }
}
exports.default = startCluster;
