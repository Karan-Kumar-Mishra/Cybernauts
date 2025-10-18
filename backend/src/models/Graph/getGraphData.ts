import CACHE_TTL from "../../config/CACHE_TTL";
import pool from "../../config/pool";
import { redisClient } from "../../config/redis";
async function getGraphData(): Promise<any> {
    const cacheKey = 'graph:data';

    // Try cache first
    try {
        if (redisClient.isReady()) {
            const cachedGraph = await redisClient.get(cacheKey);
            if (cachedGraph) {
                console.log('Returning cached graph data');
                return cachedGraph;
            }
        }
    } catch (error) {
        console.warn('Redis cache miss for graph data');
    }

    console.log('🔄 Fetching fresh graph data from database');

    // Get all users with their calculated popularity scores
    const usersResult = await pool.query(`
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
    console.log(`👥 Found ${users.length} users in database`);

    // Get all relationships - FIXED: Remove the WHERE clause that filters relationships
    const relationshipsResult = await pool.query(`
    SELECT 
      user_id as source,
      friend_id as target
    FROM relationships
    ORDER BY user_id, friend_id
  `);

    console.log(`🔗 Found ${relationshipsResult.rows.length} relationships in database:`);

    if (relationshipsResult.rows.length > 0) {
        relationshipsResult.rows.forEach((rel: any) => {
            console.log(`   ${rel.source} → ${rel.target}`);
        });
    } else {
        console.log('   No relationships found in database');
    }

    // Generate positions for nodes
    const nodes = users.map((user: any, index: number) => {
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

    // Create edges - ensure we don't create duplicates
    const edgeMap = new Map();
    const edges = relationshipsResult.rows.map((rel: any, index: number) => {
        // Create a unique key for the edge to avoid duplicates
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
    }).filter(Boolean); // Remove null entries

    console.log(`🎯 Final graph data: ${nodes.length} nodes, ${edges.length} edges`);

    const graphData = { nodes, edges };

    // Cache the graph data
    try {
        if (redisClient.isReady()) {
            await redisClient.set(cacheKey, graphData, CACHE_TTL);
            console.log('✅ Graph data cached successfully');
        }
    } catch (error) {
        console.warn('Failed to cache graph data');
    }

    return graphData;
}
export default getGraphData;