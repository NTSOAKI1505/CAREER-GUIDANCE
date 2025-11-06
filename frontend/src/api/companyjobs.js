// src/api/companyJobs.js
import axios from "axios";

const API_URL =
  process.env.REACT_APP_BACKEND_URL || "https://career-guidance-backend.onrender.com";

/**
 * Create a new job
 */
export const createJob = async (data, token) => {
  const res = await axios.post(`${API_URL}/api/jobs`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Get all jobs for a company
 */
export const getCompanyJobs = async (companyId, token) => {
  const res = await axios.get(`${API_URL}/api/jobs/company/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
