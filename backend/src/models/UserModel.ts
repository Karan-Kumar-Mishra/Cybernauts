import createUser from "./users/createUser";
import getAllUsers from "./users/getAllUsers";
import getUserById from "./users/getUserById";
import updateUser from "./users/updateUser";
import deleteUser from "./users/deleteUser";
import invalidateGraphCache from "./Cache/invalidateGraphCache";
import invalidateUserCache from "./Cache/invalidateUserCache";
import createRelationship from "./Relationships/createRelationship";
import removeRelationship from "./Relationships/removeRelationship";
import getFriends from "./users/getFriends";
import calculatePopularityScore from "./Popularity/calculatePopularityScore";
import updatePopularityScore from "./Popularity/updatePopularityScore";
import getAllHobbies from "./Hobby/getAllHobbies";
import getGraphData from "./Graph/getGraphData";
import addHobby from "./Hobby/addHobby";
import removeHobby from "./Hobby/removeHobby";
import testDatabaseConnection from "./testDatabaseConnection";
export class UserModel {

  createUser = createUser;
  getAllUsers = getAllUsers;
  getUserById = getUserById;
  updateUser = updateUser;
  deleteUser = deleteUser
  invalidateUserCache = invalidateUserCache;
  createRelationship = createRelationship
  invalidateGraphCache = invalidateGraphCache
  removeRelationship = removeRelationship
  getFriends = getFriends
  calculatePopularityScore = calculatePopularityScore
  updatePopularityScore = updatePopularityScore;
  getGraphData = getGraphData;
  getAllHobbies = getAllHobbies
  addHobby = addHobby
  removeHobby = removeHobby
  testDatabaseConnection = testDatabaseConnection

}