// models/application.js

export const ApplicationSchema = {
  studentId: "reference (StudentProfile)",        // Reference to the student profile
  courseId: "reference (Course)",                 // Reference to the course applied for
  facultyId: "reference (Faculty)",               // Reference to the faculty (from course)
  institutionId: "reference (InstitutionProfile)",// Reference to the institution profile (from course)
  applicationDate: "timestamp",
  status: "string",                               // Pending | Approved | Rejected | Waitlisted
  remarks: "string",                              // Optional admin comments
  createdAt: "timestamp",
  updatedAt: "timestamp",
};
