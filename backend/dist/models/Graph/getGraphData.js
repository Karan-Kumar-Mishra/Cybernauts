"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CACHE_TTL_1 = __importDefault(require("../../config/CACHE_TTL"));
const pool_1 = __importDefault(require("../../config/pool"));
const redis_1 = require("../../config/redis");
async function getGraphData() {
    const cacheKey = 'graph:data';
    try {
        if (redis_1.redisClient.isReady()) {
            const cachedGraph = await redis_1.redisClient.get(cacheKey);
            if (cachedGraph) {
                console.log('Returning cached graph data');
                return cachedGraph;
            }
        }
    }
    catch (error) {
        console.warn('Redis cache miss for graph data');
    }
    const usersResult = await pool_1.default.query(`
    SELECT 
      id,
      username,
      age,
      hobbies,
      popularity_score as "popularityScore"
    FROM users
    ORDER BY username
  `);
    const users = usersResult.rows;
    const relationshipsResult = await pool_1.default.query(`
    SELECT 
      user_id as source,
      friend_id as target
    FROM relationships
    ORDER BY user_id, friend_id
  `);
    if (relationshipsResult.rows.length > 0) {
        relationshipsResult.rows.forEach((rel) => {
            console.log(`   ${rel.source} → ${rel.target}`);
        });
    }
    else {
        console.log('   No relationships found in database');
    }
    const nodes = users.map((user, index) => {
        const gridSize = Math.ceil(Math.sqrt(users.length));
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const popularityScore = parseFloat(user.popularityScore) || 0;
        return {
            id: user.id,
            type: popularityScore > 5 ? 'highScore' : 'lowScore',
            data: {
                label: `${user.username} (${user.age})`,
                username: user.username,
                age: user.age,
                popularityScore: popularityScore,
                hobbies: user.hobbies || []
            },
            position: {
                x: col * 200 + 50,
                y: row * 150 + 50
            }
        };
    });
    const edgeMap = new Map();
    const edges = relationshipsResult.rows.map((rel, index) => {
        const edgeKey = [rel.source, rel.target].sort().join('-');
        if (!edgeMap.has(edgeKey)) {
            edgeMap.set(edgeKey, true);
            return {
                id: `edge-${rel.source}-${rel.target}-${index}`,
                source: rel.source,
                target: rel.target,
                type: 'smoothstep',
                style: { stroke: '#555', strokeWidth: 2 }
            };
        }
        return null;
    }).filter(Boolean);
    const graphData = { nodes, edges };
    try {
        if (redis_1.redisClient.isReady()) {
            await redis_1.redisClient.set(cacheKey, graphData, CACHE_TTL_1.default);
            console.log('Graph data cached successfully');
        }
    }
    catch (error) {
        console.warn('Failed to cache graph data');
    }
    return graphData;
}
exports.default = getGraphData;
