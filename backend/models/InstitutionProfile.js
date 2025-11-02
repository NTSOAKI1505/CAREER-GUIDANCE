export const InstitutionProfileSchema = {
  userId: "reference (User)", // foreign key link to users/{userId}
  institutionName: "string",   // name of the institution
  location: "string",          // physical location or address
  type: "string",              // type: University | College | Training Center
  description: "string",       // short description about the institution
  website: "string (URL)",     // official website URL
  logoUrl: "string (URL)",     // logo image URL
  contactEmail: "string",      // email contact
  contactPhone: "string",      // phone contact
  createdAt: "timestamp",      // when profile is first created
  updatedAt: "timestamp",      // when profile is last edited
};
