export const CourseSchema = {
  facultyId: "reference (Faculty)",                // Foreign key to faculty
  institutionId: "reference (InstitutionProfile)",// Foreign key to institution
  courseName: "string",                            // Name of the course
  description: "string",                           // Short description of the course
  courseCode: "string",                            // Unique course code
  credits: "number",                               // Number of credits
  duration: "string",                              // Duration (e.g., "4 years")
  createdAt: "timestamp",                          // Record creation time
  updatedAt: "timestamp",                          // Record last updated time
};
