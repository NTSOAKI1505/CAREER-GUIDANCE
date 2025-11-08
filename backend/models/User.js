export const UserSchema = {
  firstName: "string",
  lastName: "string",
  email: "string",
  password: "string (hashed)",
  role: "string (student | institution | company | admin)",
  createdAt: "timestamp",

  // ✅ For forgot/reset password
  passwordResetToken: "string | null", // hashed token for password reset
  passwordResetExpires: "timestamp | null", // token expiration time
};
