// Mock API functions that simulate backend behavior
import {
  mockUsers,
  mockNotices,
  mockCourses,
  mockAssignments,
  mockAttendance,
  mockLostFound,
  mockChatRooms,
  mockMessages,
} from "../mockData";

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate random errors (5% chance)
const shouldFail = () => Math.random() < 0.05;

// Helper to find item by ID
const findById = (array, id) =>
  array.find((item) => (item._id || item.id) === id);

// Helper to generate new ID
const generateId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Normalize attachment objects with consistent IDs
const normalizeAttachments = (attachments = [], prefix = "file") =>
  (attachments || []).map((attachment) => ({
    ...attachment,
    id: attachment.id || generateId(prefix),
  }));

// Helper to get current user from localStorage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// ==================== AUTH MOCK API ====================
export const mockAuthAPI = {
  login: async (credentials) => {
    await delay(800);

    if (shouldFail()) {
      throw {
        response: { data: { message: "Login failed. Invalid credentials." } },
      };
    }

    const user = mockUsers.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw { response: { data: { message: "Invalid email or password." } } };
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    const token = `mock_token_${user._id}_${Date.now()}`;

    return {
      data: {
        token,
        user: userWithoutPassword,
      },
    };
  },

  register: async (data) => {
    await delay(1000);

    if (shouldFail()) {
      throw {
        response: {
          data: { message: "Registration failed. Please try again." },
        },
      };
    }

    // Check if email already exists
    if (mockUsers.find((u) => u.email === data.email)) {
      throw { response: { data: { message: "Email already registered." } } };
    }

    const newUser = {
      _id: generateId("user"),
      id: generateId("user"),
      ...data,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    return {
      data: {
        message: "Registration successful",
        user: newUser,
      },
    };
  },

  logout: async () => {
    await delay(300);
    return { data: { message: "Logged out successfully" } };
  },
};

// ==================== USERS MOCK API ====================
export const mockUsersAPI = {
  getAll: async () => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch users" } } };
    }
    return { data: mockUsers.map(({ password, ...user }) => user) };
  },

  getById: async (id) => {
    await delay(400);
    if (shouldFail()) {
      throw { response: { data: { message: "User not found" } } };
    }
    const user = findById(mockUsers, id);
    if (!user) {
      throw { response: { data: { message: "User not found" } } };
    }
    const { password, ...userWithoutPassword } = user;
    return { data: userWithoutPassword };
  },

  create: async (data) => {
    await delay(800);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to create user" } } };
    }
    const newUser = {
      _id: generateId("user"),
      id: generateId("user"),
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return { data: newUser };
  },

  update: async (id, data) => {
    await delay(700);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to update user" } } };
    }
    const user = findById(mockUsers, id);
    if (!user) {
      throw { response: { data: { message: "User not found" } } };
    }
    Object.assign(user, data, { updatedAt: new Date().toISOString() });
    return { data: user };
  },

  delete: async (id) => {
    await delay(500);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to delete user" } } };
    }
    const index = mockUsers.findIndex((u) => (u._id || u.id) === id);
    if (index === -1) {
      throw { response: { data: { message: "User not found" } } };
    }
    mockUsers.splice(index, 1);
    return { data: { message: "User deleted successfully" } };
  },
};

// ==================== NOTICES MOCK API ====================
export const mockNoticesAPI = {
  getAll: async () => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch notices" } } };
    }
    return { data: [...mockNotices].reverse() }; // Most recent first
  },

  getById: async (id) => {
    await delay(400);
    if (shouldFail()) {
      throw { response: { data: { message: "Notice not found" } } };
    }
    const notice = findById(mockNotices, id);
    if (!notice) {
      throw { response: { data: { message: "Notice not found" } } };
    }
    return { data: notice };
  },

  create: async (data) => {
    await delay(800);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to create notice" } } };
    }
    const newNotice = {
      _id: generateId("notice"),
      id: generateId("notice"),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockNotices.push(newNotice);
    return { data: newNotice };
  },

  update: async (id, data) => {
    await delay(700);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to update notice" } } };
    }
    const notice = findById(mockNotices, id);
    if (!notice) {
      throw { response: { data: { message: "Notice not found" } } };
    }
    Object.assign(notice, data, { updatedAt: new Date().toISOString() });
    return { data: notice };
  },

  delete: async (id) => {
    await delay(500);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to delete notice" } } };
    }
    const index = mockNotices.findIndex((n) => (n._id || n.id) === id);
    if (index === -1) {
      throw { response: { data: { message: "Notice not found" } } };
    }
    mockNotices.splice(index, 1);
    return { data: { message: "Notice deleted successfully" } };
  },
};

// ==================== COURSES MOCK API ====================
export const mockCoursesAPI = {
  getAll: async () => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch courses" } } };
    }
    return { data: [...mockCourses] };
  },

  getById: async (id) => {
    await delay(400);
    if (shouldFail()) {
      throw { response: { data: { message: "Course not found" } } };
    }
    const course = findById(mockCourses, id);
    if (!course) {
      throw { response: { data: { message: "Course not found" } } };
    }
    // Add students data
    const students = mockUsers.filter((u) =>
      course.enrolledStudents?.includes(u._id || u.id)
    );
    return { data: { ...course, students } };
  },

  create: async (data) => {
    await delay(800);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to create course" } } };
    }
    const newCourse = {
      _id: generateId("course"),
      id: generateId("course"),
      ...data,
      enrolledStudents: [],
      createdAt: new Date().toISOString(),
    };
    mockCourses.push(newCourse);
    return { data: newCourse };
  },

  update: async (id, data) => {
    await delay(700);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to update course" } } };
    }
    const course = findById(mockCourses, id);
    if (!course) {
      throw { response: { data: { message: "Course not found" } } };
    }
    Object.assign(course, data, { updatedAt: new Date().toISOString() });
    return { data: course };
  },

  delete: async (id) => {
    await delay(500);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to delete course" } } };
    }
    const index = mockCourses.findIndex((c) => (c._id || c.id) === id);
    if (index === -1) {
      throw { response: { data: { message: "Course not found" } } };
    }
    mockCourses.splice(index, 1);
    return { data: { message: "Course deleted successfully" } };
  },

  enroll: async (courseId) => {
    await delay(700);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to enroll in course" } } };
    }
    const course = findById(mockCourses, courseId);
    if (!course) {
      throw { response: { data: { message: "Course not found" } } };
    }
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }
    const studentId = currentUser._id || currentUser.id;
    if (!course.enrolledStudents) {
      course.enrolledStudents = [];
    }
    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
    }

    // Ensure a private chat room exists between student and instructor
    let chatRoom = mockChatRooms.find(
      (room) =>
        room.type === "course_private" &&
        room.courseId === courseId &&
        room.participants?.includes(studentId) &&
        room.participants?.includes(course.instructorId)
    );

    if (!chatRoom) {
      const roomId = generateId("room");
      chatRoom = {
        _id: roomId,
        id: roomId,
        type: "course_private",
        courseId: courseId,
        courseName: course.name,
        courseCode: course.code,
        participants: [studentId, course.instructorId],
        createdAt: new Date().toISOString(),
      };
      mockChatRooms.push(chatRoom);

      const instructor = findById(mockUsers, course.instructorId);
      const welcomeMessageId = generateId("msg");
      mockMessages.push({
        _id: welcomeMessageId,
        id: welcomeMessageId,
        roomId: chatRoom.id,
        senderId: course.instructorId,
        senderName: instructor?.name || "Instructor",
        content: `Welcome to ${course.name}! Feel free to ask any questions here.`,
        attachments: [],
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    return { data: { message: "Enrolled successfully", course, chatRoom } };
  },
};

// ==================== ASSIGNMENTS MOCK API ====================
export const mockAssignmentsAPI = {
  getAll: async () => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch assignments" } } };
    }
    const currentUser = getCurrentUser();
    // For students, mark which assignments they've submitted
    const assignments = mockAssignments.map((assignment) => {
      if (currentUser?.role === "student") {
        const submission = assignment.submissions?.find(
          (s) => s.studentId === (currentUser._id || currentUser.id)
        );
        return {
          ...assignment,
          attachments: normalizeAttachments(
            assignment.attachments,
            "assignmentFile"
          ),
          submitted: !!submission,
          studentSubmission: submission
            ? {
                ...submission,
                attachments: normalizeAttachments(
                  submission.attachments,
                  "submissionFile"
                ),
              }
            : null,
          submissionCount: assignment.submissions?.length || 0,
        };
      }
      return {
        ...assignment,
        attachments: normalizeAttachments(
          assignment.attachments,
          "assignmentFile"
        ),
        submissionCount: assignment.submissions?.length || 0,
      };
    });
    return { data: assignments };
  },

  getById: async (id) => {
    await delay(400);
    if (shouldFail()) {
      throw { response: { data: { message: "Assignment not found" } } };
    }
    const assignment = findById(mockAssignments, id);
    if (!assignment) {
      throw { response: { data: { message: "Assignment not found" } } };
    }
    return { data: assignment };
  },

  create: async (data) => {
    await delay(800);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to create assignment" } } };
    }
    const newAssignment = {
      _id: generateId("assignment"),
      id: generateId("assignment"),
      ...data,
      submissions: [],
      createdAt: new Date().toISOString(),
      attachments: normalizeAttachments(data.attachments, "assignmentFile"),
    };
    mockAssignments.push(newAssignment);
    return { data: newAssignment };
  },

  update: async (id, data) => {
    await delay(700);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to update assignment" } } };
    }
    const assignment = findById(mockAssignments, id);
    if (!assignment) {
      throw { response: { data: { message: "Assignment not found" } } };
    }
    Object.assign(assignment, data, {
      updatedAt: new Date().toISOString(),
      attachments: normalizeAttachments(
        data.attachments ?? assignment.attachments,
        "assignmentFile"
      ),
    });
    return { data: assignment };
  },

  delete: async (id) => {
    await delay(500);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to delete assignment" } } };
    }
    const index = mockAssignments.findIndex((a) => (a._id || a.id) === id);
    if (index === -1) {
      throw { response: { data: { message: "Assignment not found" } } };
    }
    mockAssignments.splice(index, 1);
    return { data: { message: "Assignment deleted successfully" } };
  },

  submit: async (id, data) => {
    await delay(800);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to submit assignment" } } };
    }
    const assignment = findById(mockAssignments, id);
    if (!assignment) {
      throw { response: { data: { message: "Assignment not found" } } };
    }
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }
    const studentId = currentUser._id || currentUser.id;
    const student = findById(mockUsers, studentId);

    // Check if already submitted
    if (!assignment.submissions) {
      assignment.submissions = [];
    }
    const existingIndex = assignment.submissions.findIndex(
      (s) => s.studentId === studentId
    );

    const submission = {
      id: generateId("submission"),
      studentId,
      studentName: student?.name || "Student",
      submittedAt: new Date().toISOString(),
      score: null,
      graded: false,
      notes: data.notes || "",
      attachments: normalizeAttachments(data.attachments, "submissionFile"),
    };

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex] = submission;
    } else {
      assignment.submissions.push(submission);
    }

    return {
      data: { message: "Assignment submitted successfully", submission },
    };
  },

  getSubmissions: async (id) => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch submissions" } } };
    }
    const assignment = findById(mockAssignments, id);
    if (!assignment) {
      throw { response: { data: { message: "Assignment not found" } } };
    }
    return {
      data: (assignment.submissions || []).map((submission) => ({
        ...submission,
        attachments: normalizeAttachments(
          submission.attachments,
          "submissionFile"
        ),
      })),
    };
  },
};

// ==================== ATTENDANCE MOCK API ====================
export const mockAttendanceAPI = {
  getAll: async () => {
    await delay(600);
    if (shouldFail()) {
      throw {
        response: { data: { message: "Failed to fetch attendance records" } },
      };
    }
    const records = mockAttendance.map((record) => ({
      ...record,
      proof: normalizeAttachments(record.proof, "attendanceProof"),
    }));
    return { data: records };
  },

  getByCourse: async (courseId) => {
    await delay(500);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch attendance" } } };
    }
    const records = mockAttendance
      .filter((a) => a.courseId === courseId)
      .map((record) => ({
        ...record,
        proof: normalizeAttachments(record.proof, "attendanceProof"),
      }));
    return { data: records };
  },

  mark: async (data) => {
    await delay(1000);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to mark attendance" } } };
    }
    const currentUser = getCurrentUser();
    const newRecords = data.records.map((record) => {
      const student = findById(mockUsers, record.studentId);
      const course = findById(mockCourses, data.courseId);
      const marker = findById(
        mockUsers,
        currentUser?._id || currentUser?.id || "cr1"
      );
      return {
        _id: generateId("attendance"),
        id: generateId("attendance"),
        studentId: record.studentId,
        studentName: student?.name || "Student",
        courseId: data.courseId,
        courseName: course?.name || "Course",
        courseCode: course?.code || "",
        date: data.date,
        present: record.present,
        markedBy: currentUser?._id || currentUser?.id || "cr1",
        markedByName: marker?.name || "Class Representative",
        createdAt: new Date().toISOString(),
        proof: normalizeAttachments(record.proof, "attendanceProof"),
        notes: record.notes || "",
      };
    });
    mockAttendance.push(...newRecords);
    return {
      data: { message: "Attendance marked successfully", records: newRecords },
    };
  },

  markSelf: async (data) => {
    await delay(800);
    if (shouldFail()) {
      throw {
        response: { data: { message: "Failed to submit attendance" } },
      };
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }

    const userId = currentUser._id || currentUser.id;
    const course = findById(mockCourses, data.courseId);
    if (!course) {
      throw { response: { data: { message: "Course not found" } } };
    }

    const proof = normalizeAttachments(data.proof, "attendanceProof");
    if (!proof.length) {
      throw {
        response: { data: { message: "Attendance proof is required" } },
      };
    }

    const recordId = generateId("attendance");
    const newRecord = {
      _id: recordId,
      id: recordId,
      studentId: userId,
      studentName: currentUser.name || "Student",
      courseId: course._id || course.id,
      courseName: course.name,
      courseCode: course.code,
      date: data.date || new Date().toISOString(),
      present: true,
      markedBy: userId,
      markedByName: currentUser.name || "Student",
      createdAt: new Date().toISOString(),
      proof,
      notes: data.notes || "Self check-in",
      source: "self",
    };

    mockAttendance.push(newRecord);
    return { data: { message: "Attendance submitted", record: newRecord } };
  },

  update: async (id, data) => {
    await delay(700);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to update attendance" } } };
    }
    const record = findById(mockAttendance, id);
    if (!record) {
      throw { response: { data: { message: "Attendance record not found" } } };
    }
    Object.assign(record, data, { updatedAt: new Date().toISOString() });
    return { data: record };
  },
};

// ==================== LOST & FOUND MOCK API ====================
export const mockLostFoundAPI = {
  getAll: async () => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch items" } } };
    }
    return { data: [...mockLostFound].reverse() }; // Most recent first
  },

  getById: async (id) => {
    await delay(400);
    if (shouldFail()) {
      throw { response: { data: { message: "Item not found" } } };
    }
    const item = findById(mockLostFound, id);
    if (!item) {
      throw { response: { data: { message: "Item not found" } } };
    }
    return { data: item };
  },

  create: async (data) => {
    await delay(800);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to report item" } } };
    }
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }
    const newItem = {
      _id: generateId("lostfound"),
      id: generateId("lostfound"),
      ...data,
      reportedBy: currentUser._id || currentUser.id,
      reportedByName: currentUser.name || "User",
      verified: false,
      status: "pending",
      createdAt: new Date().toISOString(),
      date: data.date || new Date().toISOString(),
      attachments: (data.attachments || []).map((attachment) => ({
        ...attachment,
        id: attachment.id || generateId("lostfile"),
      })),
    };
    mockLostFound.push(newItem);
    return { data: newItem };
  },

  update: async (id, data) => {
    await delay(700);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to update item" } } };
    }
    const item = findById(mockLostFound, id);
    if (!item) {
      throw { response: { data: { message: "Item not found" } } };
    }
    const currentUser = getCurrentUser();
    const isOwner =
      currentUser && (currentUser._id || currentUser.id) === item.reportedBy;

    const updatedAttachments = (data.attachments ?? item.attachments ?? []).map(
      (attachment) => ({
        ...attachment,
        id: attachment.id || generateId("lostfile"),
      })
    );

    Object.assign(item, data, {
      attachments: updatedAttachments,
      updatedAt: new Date().toISOString(),
      ...(isOwner
        ? {
            verified: false,
            status: "pending",
          }
        : {}),
    });
    return { data: item };
  },

  delete: async (id) => {
    await delay(500);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to delete item" } } };
    }
    const index = mockLostFound.findIndex(
      (item) => (item._id || item.id) === id
    );
    if (index === -1) {
      throw { response: { data: { message: "Item not found" } } };
    }
    mockLostFound.splice(index, 1);
    return { data: { message: "Item deleted successfully" } };
  },

  verify: async (id) => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to verify item" } } };
    }
    const item = findById(mockLostFound, id);
    if (!item) {
      throw { response: { data: { message: "Item not found" } } };
    }
    item.verified = true;
    item.status = "approved";
    item.verifiedAt = new Date().toISOString();
    return { data: { message: "Item approved successfully", item } };
  },

  reject: async (id) => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to reject item" } } };
    }
    const item = findById(mockLostFound, id);
    if (!item) {
      throw { response: { data: { message: "Item not found" } } };
    }
    item.status = "rejected";
    item.rejectedAt = new Date().toISOString();
    return { data: { message: "Item rejected successfully", item } };
  },
};

// ==================== CHAT MOCK API ====================
export const mockChatAPI = {
  // Get all chat rooms accessible to current user
  getRooms: async () => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch chat rooms" } } };
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }

    const userId = currentUser._id || currentUser.id;
    const userRole = currentUser.role;

    // Filter rooms based on user role and participation
    let accessibleRooms = mockChatRooms.filter((room) => {
      // Check if user is a participant
      if (room.participants && room.participants.includes(userId)) {
        return true;
      }

      // Teachers see all course group chats for their courses
      if (
        userRole === "teacher" &&
        room.type === "course_group" &&
        room.instructorId === userId
      ) {
        return true;
      }

      // Students see course group chats for enrolled courses
      if (userRole === "student" && room.type === "course_group") {
        const course = mockCourses.find(
          (c) => (c._id || c.id) === room.courseId
        );
        if (
          course &&
          course.enrolledStudents &&
          course.enrolledStudents.includes(userId)
        ) {
          return true;
        }
      }

      // Teachers see course private chats where they are participants
      if (
        userRole === "teacher" &&
        room.type === "course_private" &&
        room.participants &&
        room.participants.includes(userId)
      ) {
        return true;
      }

      // Students see course private chats for their enrolled courses
      if (
        userRole === "student" &&
        room.type === "course_private" &&
        room.participants &&
        room.participants.includes(userId)
      ) {
        return true;
      }

      // CRs can see chats they are participants in
      if (
        userRole === "cr" &&
        room.participants &&
        room.participants.includes(userId)
      ) {
        return true;
      }

      return false;
    });

    // Enrich rooms with participant names
    accessibleRooms = accessibleRooms.map((room) => {
      const enrichedRoom = { ...room };
      enrichedRoom.participantsInfo = (room.participants || [])
        .map((pid) => {
          const user = mockUsers.find((u) => (u._id || u.id) === pid);
          return user ? { id: pid, name: user.name, role: user.role } : null;
        })
        .filter(Boolean);
      return enrichedRoom;
    });

    return { data: accessibleRooms };
  },

  // Get messages for a specific room
  getMessages: async (roomId) => {
    await delay(500);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to fetch messages" } } };
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }

    // Filter messages for this room
    const roomMessages = mockMessages
      .filter((msg) => msg.roomId === roomId)
      .sort(
        (a, b) =>
          new Date(a.timestamp || a.createdAt) -
          new Date(b.timestamp || b.createdAt)
      )
      .map((message) => ({
        ...message,
        attachments: normalizeAttachments(message.attachments, "chatFile"),
      }));

    return { data: roomMessages };
  },

  // Send a new message
  sendMessage: async (roomId, payload) => {
    await delay(400);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to send message" } } };
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }

    // Check if room exists and user has access
    const room = mockChatRooms.find((r) => (r._id || r.id) === roomId);
    if (!room) {
      throw { response: { data: { message: "Chat room not found" } } };
    }

    const userId = currentUser._id || currentUser.id;
    if (!room.participants || !room.participants.includes(userId)) {
      throw {
        response: { data: { message: "Access denied to this chat room" } },
      };
    }

    const content = typeof payload === "string" ? payload : payload?.content;
    const attachmentsInput =
      typeof payload === "object" ? payload?.attachments : [];

    if (!content?.trim() && !(attachmentsInput?.length > 0)) {
      throw {
        response: {
          data: { message: "Cannot send an empty message" },
        },
      };
    }

    const attachments = normalizeAttachments(attachmentsInput, "chatFile");

    // Create new message
    const newMessage = {
      _id: generateId("msg"),
      id: generateId("msg"),
      roomId: roomId,
      senderId: userId,
      senderName: currentUser.name || "User",
      content: content?.trim() || "",
      attachments,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    mockMessages.push(newMessage);
    return { data: newMessage };
  },

  // Create a new chat room (for private chats)
  createRoom: async (participantIds, courseId = null) => {
    await delay(600);
    if (shouldFail()) {
      throw { response: { data: { message: "Failed to create chat room" } } };
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { response: { data: { message: "User not authenticated" } } };
    }

    const userId = currentUser._id || currentUser.id;
    const allParticipants = [userId, ...participantIds].filter(
      (id, index, arr) => arr.indexOf(id) === index
    );

    // Check if room already exists
    const existingRoom = mockChatRooms.find((room) => {
      if (room.type === "private" && !courseId) {
        return (
          room.participants &&
          room.participants.length === allParticipants.length &&
          allParticipants.every((id) => room.participants.includes(id))
        );
      }
      return false;
    });

    if (existingRoom) {
      return { data: existingRoom };
    }

    // Determine room type
    let roomType = "private";
    let courseName = null;
    let courseCode = null;

    if (courseId) {
      const course = mockCourses.find((c) => (c._id || c.id) === courseId);
      if (course) {
        roomType = "course_private";
        courseName = course.name;
        courseCode = course.code;
      }
    }

    // Create new room
    const newRoom = {
      _id: generateId("room"),
      id: generateId("room"),
      type: roomType,
      participants: allParticipants,
      courseId: courseId,
      courseName: courseName,
      courseCode: courseCode,
      createdAt: new Date().toISOString(),
    };

    mockChatRooms.push(newRoom);
    return { data: newRoom };
  },
};
