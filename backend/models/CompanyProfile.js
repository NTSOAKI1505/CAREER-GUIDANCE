// models/CompanyProfile.js

export const CompanyProfileSchema = {
  userId: "reference (User)", // link to users/{userId}
  companyName: "string",
  location: "string",
  industry: "string",
  description: "string",
  website: "string (URL)",
  logoUrl: "string (URL)",
  contactEmail: "string",
  contactPhone: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp",
};
