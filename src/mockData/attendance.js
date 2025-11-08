// src/mockData/attendance.js
export const mockAttendance = [
  {
    _id: "attendance1",
    id: "attendance1",
    studentId: "student1",
    studentName: "Alice Williams",
    courseId: "course1",
    courseName: "Introduction to Computer Science",
    courseCode: "CS101",
    date: "2024-01-20T00:00:00Z",
    present: true,
    markedBy: "cr1",
    markedByName: "David Brown",
    createdAt: "2024-01-20T09:00:00Z",
    proof: [
      {
        id: "attendance1_proof1",
        name: "alice-check-in.jpg",
        type: "image/jpeg",
        size: 128000,
        url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=60",
      },
    ],
    notes: "Checked in at main hall.",
    latitude: 28.6139,
    longitude: 77.209,
    distance: 5,
    accuracy: 8,
  },
  // ... keep your other mock rows as-is
];
