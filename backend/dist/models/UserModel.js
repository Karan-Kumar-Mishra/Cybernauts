"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const createUser_1 = __importDefault(require("./users/createUser"));
const getAllUsers_1 = __importDefault(require("./users/getAllUsers"));
const getUserById_1 = __importDefault(require("./users/getUserById"));
const updateUser_1 = __importDefault(require("./users/updateUser"));
const deleteUser_1 = __importDefault(require("./users/deleteUser"));
const invalidateGraphCache_1 = __importDefault(require("./Cache/invalidateGraphCache"));
const invalidateUserCache_1 = __importDefault(require("./Cache/invalidateUserCache"));
const createRelationship_1 = __importDefault(require("./Relationships/createRelationship"));
const removeRelationship_1 = __importDefault(require("./Relationships/removeRelationship"));
const getFriends_1 = __importDefault(require("./users/getFriends"));
const calculatePopularityScore_1 = __importDefault(require("./Popularity/calculatePopularityScore"));
const updatePopularityScore_1 = __importDefault(require("./Popularity/updatePopularityScore"));
const getAllHobbies_1 = __importDefault(require("./Hobby/getAllHobbies"));
const getGraphData_1 = __importDefault(require("./Graph/getGraphData"));
const addHobby_1 = __importDefault(require("./Hobby/addHobby"));
const removeHobby_1 = __importDefault(require("./Hobby/removeHobby"));
const testDatabaseConnection_1 = __importDefault(require("./testDatabaseConnection"));
class UserModel {
    constructor() {
        this.createUser = createUser_1.default;
        this.getAllUsers = getAllUsers_1.default;
        this.getUserById = getUserById_1.default;
        this.updateUser = updateUser_1.default;
        this.deleteUser = deleteUser_1.default;
        this.invalidateUserCache = invalidateUserCache_1.default;
        this.createRelationship = createRelationship_1.default;
        this.invalidateGraphCache = invalidateGraphCache_1.default;
        this.removeRelationship = removeRelationship_1.default;
        this.getFriends = getFriends_1.default;
        this.calculatePopularityScore = calculatePopularityScore_1.default;
        this.updatePopularityScore = updatePopularityScore_1.default;
        this.getGraphData = getGraphData_1.default;
        this.getAllHobbies = getAllHobbies_1.default;
        this.addHobby = addHobby_1.default;
        this.removeHobby = removeHobby_1.default;
        this.testDatabaseConnection = testDatabaseConnection_1.default;
    }
}
exports.UserModel = UserModel;
