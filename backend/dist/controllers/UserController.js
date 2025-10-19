"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const pool_1 = __importDefault(require("../config/pool"));
const UserServiceInstance_1 = __importDefault(require("../config/UserServiceInstance"));
const getAllUsers_1 = __importDefault(require("./Users/getAllUsers"));
const createUser_1 = __importDefault(require("./Users/createUser"));
const updateUser_1 = __importDefault(require("./Users/updateUser"));
const deleteUser_1 = require("./Users/deleteUser");
const createRelationship_1 = __importDefault(require("./Relationship/createRelationship"));
const removeRelationship_1 = __importDefault(require("./Relationship/removeRelationship"));
const getAllHobbies_1 = __importDefault(require("./Hobbies/getAllHobbies"));
const addHobby_1 = __importDefault(require("./Hobbies/addHobby"));
const removeHobby_1 = __importDefault(require("./Hobbies/removeHobby"));
const getGraphData_1 = __importDefault(require("./Graph/getGraphData"));
class UserController {
    constructor() {
        this.getAllUsers = getAllUsers_1.default;
        this.createUser = createUser_1.default;
        this.updateUser = updateUser_1.default;
        this.deleteUser = deleteUser_1.deleteUser;
        this.createRelationship = createRelationship_1.default;
        this.removeRelationship = removeRelationship_1.default;
        this.addHobby = addHobby_1.default;
        this.removeHobby = removeHobby_1.default;
        this.getGraphData = getGraphData_1.default;
        this.getAllHobbies = getAllHobbies_1.default;
        this.debugDatabaseState = async (req, res) => {
            try {
                const usersResult = await pool_1.default.query('SELECT id, username FROM users');
                const users = usersResult.rows;
                const relationshipsResult = await pool_1.default.query('SELECT user_id, friend_id FROM relationships');
                const relationships = relationshipsResult.rows;
                const usersCount = await pool_1.default.query('SELECT COUNT(*) FROM users');
                const relationshipsCount = await pool_1.default.query('SELECT COUNT(*) FROM relationships');
                res.json({
                    database: {
                        users: {
                            count: parseInt(usersCount.rows[0].count),
                            list: users
                        },
                        relationships: {
                            count: parseInt(relationshipsCount.rows[0].count),
                            list: relationships
                        }
                    },
                    graphData: await (0, UserServiceInstance_1.default)().getGraphData()
                });
            }
            catch (error) {
                console.error('Debug database state error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        };
    }
}
exports.UserController = UserController;
