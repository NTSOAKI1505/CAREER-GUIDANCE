// models/faculty.js

export const FacultySchema = {
  institutionId: "reference (InstitutionProfile)", // foreign key from InstitutionProfile
  facultyName: "string",                           // name of the faculty
  description: "string",                           // short description about the faculty
  deanName: "string",                              // name of the dean or head
  contactEmail: "string",                          // faculty contact email
  contactPhone: "string",                          // faculty contact phone
  establishedYear: "number",                       // year faculty was established
  website: "string (URL)",                         // optional: faculty website
  createdAt: "timestamp",                          // record creation time
  updatedAt: "timestamp",                          // record last updated time
};
