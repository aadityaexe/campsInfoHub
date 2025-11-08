// src/api/attendanceAPI.js
import axios from "axios";

// Use real backend if provided, otherwise a mock namespace
const BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/attendance`
  : "/mock/attendance";

export const attendanceAPI = {
  // Student self-mark
  markSelf: (payload) => axios.post(`${BASE}/self`, payload),

  // Teacher bulk mark
  mark: (payload) => axios.post(`${BASE}/bulk`, payload),

  // Submit with multipart (optional usage)
  submit: (formData) =>
    axios.post(`${BASE}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Fetch all records
  getAll: () => axios.get(`${BASE}/records`),
};
