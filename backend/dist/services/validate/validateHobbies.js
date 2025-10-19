"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateHobbies(hobbies) {
    if (!hobbies.every(hobby => typeof hobby === 'string' && hobby.trim().length > 0)) {
        throw new Error('All hobbies must be non-empty strings');
    }
}
exports.default = validateHobbies;
