"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const UserModelInstance_1 = __importDefault(require("../config/UserModelInstance"));
const getAllUsers_1 = __importDefault(require("./Users/getAllUsers"));
const createUser_1 = __importDefault(require("./Users/createUser"));
const updateUser_1 = __importDefault(require("./Users/updateUser"));
const deleteUser_1 = __importDefault(require("./Users/deleteUser"));
const createRelationship_1 = __importDefault(require("./Relationship/createRelationship"));
const removeRelationship_1 = __importDefault(require("./Relationship/removeRelationship"));
const addHobby_1 = __importDefault(require("./Hobby/addHobby"));
const getAllHobbies_1 = __importDefault(require("./Hobby/getAllHobbies"));
const removeHobby_1 = __importDefault(require("./Hobby/removeHobby"));
const validateUserData_1 = __importDefault(require("./validate/validateUserData"));
const validateHobbies_1 = __importDefault(require("./validate/validateHobbies"));
const getGraphData_1 = __importDefault(require("./Graph/getGraphData"));
class UserService {
    constructor() {
        this.getAllUsers = getAllUsers_1.default;
        this.createUser = createUser_1.default;
        this.updateUser = updateUser_1.default;
        this.deleteUser = deleteUser_1.default;
        this.createRelationship = createRelationship_1.default;
        this.removeRelationship = removeRelationship_1.default;
        this.addHobby = addHobby_1.default;
        this.getAllHobbies = getAllHobbies_1.default;
        this.removeHobby = removeHobby_1.default;
        this.validateUserData = validateUserData_1.default;
        this.validateHobbies = validateHobbies_1.default;
        this.getGraphData = getGraphData_1.default;
        (0, UserModelInstance_1.default)().testDatabaseConnection();
    }
}
exports.UserService = UserService;
