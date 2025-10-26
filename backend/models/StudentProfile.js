// models/StudentProfile.js

export const StudentProfileSchema = {
  userId: "reference (User)", // foreign key link to users/{userId}
  institution: "string",
  course: "string",
  yearOfStudy: "number",
  bio: "string",
  skills: ["string"],
  resumeUrl: "string (URL)",
  profilePic: "string (URL)",
  createdAt: "timestamp", // when profile is first created
  updatedAt: "timestamp", // when profile is last edited
};
    