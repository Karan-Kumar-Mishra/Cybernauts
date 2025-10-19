import { CreateUserRequest } from "../../types";
import validateHobbies from "./validateHobbies";
function validateUserData(userData: CreateUserRequest): void {
    if (!userData.username || userData.username.trim().length === 0) {
      throw new Error('Username is required');
    }
    if (userData.age < 0 || userData.age > 150) {
      throw new Error('Age must be between 0 and 150');
    }
    if (!Array.isArray(userData.hobbies)) {
      throw new Error('Hobbies must be an array');
    }
    validateHobbies(userData.hobbies);
  }
export default validateUserData;