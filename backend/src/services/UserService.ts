
import { User, CreateUserRequest, UpdateUserRequest } from '../types';
import UserModelInstance from '../config/UserModelInstance';
import getAllUsers from './Users/getAllUsers';
import createUser from './Users/createUser';
import updateUser from './Users/updateUser';
import deleteUser from './Users/deleteUser';
import createRelationship from './Relationship/createRelationship';
import removeRelationship from './Relationship/removeRelationship';
import addHobby from './Hobby/addHobby';
import getAllHobbies from './Hobby/getAllHobbies';
import removeHobby from './Hobby/removeHobby';
import validateUserData from './validate/validateUserData';
import validateHobbies from './validate/validateHobbies';
import getGraphData from './Graph/getGraphData';

export class UserService {

  constructor() {
    UserModelInstance().testDatabaseConnection();
  }
  getAllUsers = getAllUsers
  createUser = createUser
  updateUser = updateUser
  deleteUser = deleteUser
  createRelationship = createRelationship
  removeRelationship = removeRelationship
  addHobby = addHobby
  getAllHobbies = getAllHobbies
  removeHobby = removeHobby
  validateUserData = validateUserData
  validateHobbies = validateHobbies
  getGraphData = getGraphData
}