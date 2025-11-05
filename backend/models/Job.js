// models/Job.js

export const JobSchema = {
  companyId: "reference (CompanyProfile)", // Firestore document ID
  title: "string",                         // e.g., 'Software Developer'
  description: "string",
  requirements: "array of strings",        // e.g., ["JavaScript","Node.js"]
  location: "string",                       // can default to company location
  jobType: "string",                        // 'Full-time', 'Part-time', etc.
  salaryRange: "string",                    // '3000-4000 MTL'
  applicationDeadline: "timestamp",         
  createdAt: "timestamp",
  updatedAt: "timestamp",
};
