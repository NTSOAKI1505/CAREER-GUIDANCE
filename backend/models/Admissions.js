// models/Admission.js

export const AdmissionSchema = {
  applicationId: "reference (Application)",       // Reference to the student application
  studentId: "reference (StudentProfile)",       // From the application
  courseId: "reference (Course)",                // From the application
  facultyId: "reference (Faculty)",              // From the application
  institutionId: "reference (InstitutionProfile)", // From the application
  admissionStatus: "string",                     // Accepted | Rejected | Pending
  remarks: "string",                             // Optional comments from admin
  createdAt: "timestamp",
  updatedAt: "timestamp",
};
