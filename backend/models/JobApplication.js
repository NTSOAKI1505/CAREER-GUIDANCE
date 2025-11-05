// models/JobApplication.js

export const JobApplicationSchema = {
  jobId: "reference (Job)",                 // link to Jobs/{jobId}  
  studentId: "reference (StudentProfile)", // link to StudentProfiles/{studentId}  
  studentName: "string",                    // snapshot of student's full name at time of application  
  studentEmail: "string",                   // snapshot of student's email  
  studentSkills: "array of strings",       // snapshot of student's skills  
  studentCourse: "string",                  // snapshot of student's course/major  
  institutionName: "string",                // snapshot of student's institution  
  graduationYear: "number",                 // student's expected/completed graduation year
  appliedAt: "timestamp",                   // when the application was submitted  
  updatedAt: "timestamp",                   // updated when edits happen  
  status: "string",                         // e.g., 'pending', 'reviewed', 'accepted', 'rejected'  
};
