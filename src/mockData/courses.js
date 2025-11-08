// Mock courses data
export const mockCourses = [
  {
    _id: "course1",
    id: "course1",
    name: "Introduction to Computer Science",
    code: "CS101",
    description:
      "Fundamental concepts of computer science including programming basics, algorithms, and data structures.",
    instructor: "Dr. Sarah Johnson",
    instructorId: "teacher1",
    credits: 3,
    schedule: "Mon, Wed, Fri 10:00 AM - 11:00 AM",

    // ✅ required by MarkAttendance.jsx
    students: [
      {
        _id: "student1",
        id: "student1",
        name: "Alice Williams",
        email: "alice.williams@campus.edu",
      },
      {
        _id: "student2",
        id: "student2",
        name: "Bob Martinez",
        email: "bob.martinez@campus.edu",
      },
      {
        _id: "student3",
        id: "student3",
        name: "Emma Davis",
        email: "emma.davis@campus.edu",
      },
    ],

    enrolledStudents: ["student1", "student2", "student3"],
    capacity: 50,
    createdAt: "2024-01-01T00:00:00Z",
  },

  {
    _id: "course2",
    id: "course2",
    name: "Calculus I",
    code: "MATH101",
    description:
      "Introduction to differential and integral calculus with applications.",
    instructor: "Prof. Michael Chen",
    instructorId: "teacher2",
    credits: 4,
    schedule: "Tue, Thu 2:00 PM - 4:00 PM",

    students: [
      {
        _id: "student1",
        id: "student1",
        name: "Alice Williams",
        email: "alice.williams@campus.edu",
      },
      {
        _id: "student2",
        id: "student2",
        name: "Bob Martinez",
        email: "bob.martinez@campus.edu",
      },
    ],

    enrolledStudents: ["student1", "student2"],
    capacity: 40,
    createdAt: "2024-01-01T00:00:00Z",
  },

  {
    _id: "course3",
    id: "course3",
    name: "Data Structures and Algorithms",
    code: "CS201",
    description:
      "Advanced data structures, algorithm analysis, and problem-solving techniques.",
    instructor: "Dr. Sarah Johnson",
    instructorId: "teacher1",
    credits: 3,
    schedule: "Mon, Wed 1:00 PM - 2:30 PM",

    students: [
      {
        _id: "student1",
        id: "student1",
        name: "Alice Williams",
        email: "alice.williams@campus.edu",
      },
      {
        _id: "student3",
        id: "student3",
        name: "Emma Davis",
        email: "emma.davis@campus.edu",
      },
    ],

    enrolledStudents: ["student1", "student3"],
    capacity: 35,
    createdAt: "2024-01-01T00:00:00Z",
  },

  {
    _id: "course4",
    id: "course4",
    name: "Database Systems",
    code: "CS301",
    description:
      "Design and implementation of database systems, SQL, and data modeling.",
    instructor: "Dr. Sarah Johnson",
    instructorId: "teacher1",
    credits: 3,
    schedule: "Tue, Thu 10:00 AM - 11:30 AM",

    students: [
      {
        _id: "student2",
        id: "student2",
        name: "Bob Martinez",
        email: "bob.martinez@campus.edu",
      },
      {
        _id: "student3",
        id: "student3",
        name: "Emma Davis",
        email: "emma.davis@campus.edu",
      },
    ],

    enrolledStudents: ["student2", "student3"],
    capacity: 30,
    createdAt: "2024-01-01T00:00:00Z",
  },

  {
    _id: "course5",
    id: "course5",
    name: "Linear Algebra",
    code: "MATH201",
    description:
      "Vector spaces, linear transformations, matrices, and eigenvalues.",
    instructor: "Prof. Michael Chen",
    instructorId: "teacher2",
    credits: 3,
    schedule: "Mon, Wed, Fri 2:00 PM - 3:00 PM",

    students: [
      {
        _id: "student1",
        id: "student1",
        name: "Alice Williams",
        email: "alice.williams@campus.edu",
      },
    ],

    enrolledStudents: ["student1"],
    capacity: 40,
    createdAt: "2024-01-01T00:00:00Z",
  },
];
