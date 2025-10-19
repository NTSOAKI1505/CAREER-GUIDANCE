// models/User.js

export const UserSchema = {
  firstName: "string",
  lastName: "string",
  email: "string",
  password: "string (hashed)",
  role: "string (student | institution | company | admin)",
  createdAt: "timestamp",
};
