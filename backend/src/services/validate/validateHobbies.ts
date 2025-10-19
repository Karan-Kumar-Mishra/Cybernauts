function validateHobbies(hobbies: string[]): void {
    if (!hobbies.every(hobby => typeof hobby === 'string' && hobby.trim().length > 0)) {
      throw new Error('All hobbies must be non-empty strings');
    }
  }
export default validateHobbies;