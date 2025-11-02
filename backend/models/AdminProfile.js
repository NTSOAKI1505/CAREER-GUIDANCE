// models/AdminProfile.js

export const AdminProfileSchema = {
  userId: "reference (User)", // foreign key link to users/{userId}
  department: "string",
  roleInAdmin: "string",
  bio: "string",
  contactEmail: "string (email)",
  contactPhone: "string",
  profilePic: "string (URL)",
  createdAt: "timestamp", // when profile is first created
  updatedAt: "timestamp", // when profile is last edited
};
