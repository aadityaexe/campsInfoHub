import axios from "axios";
import {
  mockAuthAPI,
  mockUsersAPI,
  mockNoticesAPI,
  mockCoursesAPI,
  mockAssignmentsAPI,
  mockAttendanceAPI,
  mockLostFoundAPI,
  mockChatAPI,
} from "./mockApi";

// Decide if mocks are used
const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_API === "true" ||
  !import.meta.env.VITE_API_BASE_URL;

// Axios instance (for real API)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Token handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Wrap mock functions to look like axios responses
const wrapMock =
  (fn) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw {
        response: {
          data: { message: err.message || "Mock API Error" },
          status: 500,
        },
      };
    }
  };

// AUTH
export const authAPI = USE_MOCK_API
  ? {
      login: wrapMock(mockAuthAPI.login),
      register: wrapMock(mockAuthAPI.register),
      logout: wrapMock(mockAuthAPI.logout),
    }
  : {
      login: (data) => api.post("/auth/login", data),
      register: (data) => api.post("/auth/register", data),
      logout: () => api.post("/auth/logout"),
    };

// USERS
export const usersAPI = USE_MOCK_API
  ? {
      getAll: wrapMock(mockUsersAPI.getAll),
      getById: wrapMock(mockUsersAPI.getById),
      create: wrapMock(mockUsersAPI.create),
      update: wrapMock(mockUsersAPI.update),
      delete: wrapMock(mockUsersAPI.delete),
    }
  : {
      getAll: () => api.get("/users"),
      getById: (id) => api.get(`/users/${id}`),
      create: (data) => api.post("/users", data),
      update: (id, data) => api.put(`/users/${id}`, data),
      delete: (id) => api.delete(`/users/${id}`),
    };

// NOTICES
export const noticesAPI = USE_MOCK_API
  ? {
      getAll: wrapMock(mockNoticesAPI.getAll),
      getById: wrapMock(mockNoticesAPI.getById),
      create: wrapMock(mockNoticesAPI.create),
      update: wrapMock(mockNoticesAPI.update),
      delete: wrapMock(mockNoticesAPI.delete),
    }
  : {
      getAll: () => api.get("/notices"),
      getById: (id) => api.get(`/notices/${id}`),
      create: (data) => api.post("/notices", data),
      update: (id, data) => api.put(`/notices/${id}`, data),
      delete: (id) => api.delete(`/notices/${id}`),
    };

// COURSES
export const coursesAPI = USE_MOCK_API
  ? {
      getAll: wrapMock(mockCoursesAPI.getAll),
      getById: wrapMock(mockCoursesAPI.getById),
      create: wrapMock(mockCoursesAPI.create),
      update: wrapMock(mockCoursesAPI.update),
      delete: wrapMock(mockCoursesAPI.delete),
      enroll: wrapMock(mockCoursesAPI.enroll),
    }
  : {
      getAll: () => api.get("/courses"),
      getById: (id) => api.get(`/courses/${id}`),
      create: (data) => api.post("/courses", data),
      update: (id, data) => api.put(`/courses/${id}`, data),
      delete: (id) => api.delete(`/courses/${id}`),
      enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
    };

// ASSIGNMENTS
export const assignmentsAPI = USE_MOCK_API
  ? {
      getAll: wrapMock(mockAssignmentsAPI.getAll),
      getById: wrapMock(mockAssignmentsAPI.getById),
      create: wrapMock(mockAssignmentsAPI.create),
      update: wrapMock(mockAssignmentsAPI.update),
      delete: wrapMock(mockAssignmentsAPI.delete),
      submit: wrapMock(mockAssignmentsAPI.submit),
      getSubmissions: wrapMock(mockAssignmentsAPI.getSubmissions),
    }
  : {
      getAll: () => api.get("/assignments"),
      getById: (id) => api.get(`/assignments/${id}`),
      create: (data) => api.post("/assignments", data),
      update: (id, data) => api.put(`/assignments/${id}`, data),
      delete: (id) => api.delete(`/assignments/${id}`),
      submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
      getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
    };

// ATTENDANCE
export const attendanceAPI = USE_MOCK_API
  ? {
      getAll: wrapMock(mockAttendanceAPI.getAll),
      getByCourse: wrapMock(mockAttendanceAPI.getByCourse),
      mark: wrapMock(mockAttendanceAPI.mark),
      markSelf: wrapMock(mockAttendanceAPI.markSelf),
      update: wrapMock(mockAttendanceAPI.update),
    }
  : {
      getAll: () => api.get("/attendance"),
      getByCourse: (id) => api.get(`/attendance/course/${id}`),
      mark: (data) => api.post("/attendance", data),
      markSelf: (data) => api.post("/attendance/self", data),
      update: (id, data) => api.put(`/attendance/${id}`, data),
    };

// LOST & FOUND
export const lostFoundAPI = USE_MOCK_API
  ? {
      getAll: wrapMock(mockLostFoundAPI.getAll),
      getById: wrapMock(mockLostFoundAPI.getById),
      create: wrapMock(mockLostFoundAPI.create),
      update: wrapMock(mockLostFoundAPI.update),
      delete: wrapMock(mockLostFoundAPI.delete),
      verify: wrapMock(mockLostFoundAPI.verify),
      reject: wrapMock(mockLostFoundAPI.reject),
    }
  : {
      getAll: () => api.get("/lost-found"),
      getById: (id) => api.get(`/lost-found/${id}`),
      create: (data) => api.post("/lost-found", data),
      update: (id, data) => api.put(`/lost-found/${id}`, data),
      delete: (id) => api.delete(`/lost-found/${id}`),
      verify: (id) => api.post(`/lost-found/${id}/verify`),
      reject: (id) => api.post(`/lost-found/${id}/reject`),
    };

// CHAT
export const chatAPI = USE_MOCK_API
  ? {
      getRooms: wrapMock(mockChatAPI.getRooms),
      getMessages: wrapMock(mockChatAPI.getMessages),
      sendMessage: wrapMock(mockChatAPI.sendMessage),
      createRoom: wrapMock(mockChatAPI.createRoom),
    }
  : {
      getRooms: () => api.get("/chat/rooms"),
      getMessages: (roomId) => api.get(`/chat/rooms/${roomId}/messages`),
      sendMessage: (roomId, p) => api.post(`/chat/rooms/${roomId}/messages`, p),
      createRoom: (ids, courseId) =>
        api.post("/chat/rooms", { participantIds: ids, courseId }),
    };

export default api;
