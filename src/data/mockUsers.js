// Mock users for testing/development
export const mockUsers = [
  // Admin
  {
    _id: "admin1",
    id: "admin1",
    name: "John Admin",
    email: "admin@campus.edu",
    password: "admin123",
    role: "admin",
  },
  // Teacher
  {
    _id: "teacher1",
    id: "teacher1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@campus.edu",
    password: "teacher123",
    role: "teacher",
  },
  {
    _id: "teacher2",
    id: "teacher2",
    name: "Prof. Michael Chen",
    email: "michael.chen@campus.edu",
    password: "teacher123",
    role: "teacher",
  },
  // Student
  {
    _id: "student1",
    id: "student1",
    name: "Alice Williams",
    email: "alice.williams@campus.edu",
    password: "student123",
    role: "student",
  },
  {
    _id: "student2",
    id: "student2",
    name: "Bob Martinez",
    email: "bob.martinez@campus.edu",
    password: "student123",
    role: "student",
  },
  {
    _id: "student3",
    id: "student3",
    name: "Emma Davis",
    email: "emma.davis@campus.edu",
    password: "student123",
    role: "student",
  },
  // Class Representative (CR)
  {
    _id: "cr1",
    id: "cr1",
    name: "David Brown",
    email: "david.brown@campus.edu",
    password: "cr123",
    role: "cr",
  },
  {
    _id: "cr2",
    id: "cr2",
    name: "Sophia Lee",
    email: "sophia.lee@campus.edu",
    password: "cr123",
    role: "cr",
  },
  // Alumni
  {
    _id: "alumni1",
    id: "alumni1",
    name: "Robert Taylor",
    email: "robert.taylor@alumni.campus.edu",
    password: "alumni123",
    role: "alumni",
    batch: "2020",
  },
  {
    _id: "alumni2",
    id: "alumni2",
    name: "Lisa Anderson",
    email: "lisa.anderson@alumni.campus.edu",
    password: "alumni123",
    role: "alumni",
    batch: "2019",
  },
  {
    _id: "alumni3",
    id: "alumni3",
    name: "James Wilson",
    email: "james.wilson@alumni.campus.edu",
    password: "alumni123",
    role: "alumni",
    batch: "2021",
  },
];
// Quick login credentials reference
export const loginCredentials = {
  admin: {
    email: "admin@campus.edu",
    password: "admin123",
  },
  teacher: {
    email: "sarah.johnson@campus.edu",
    password: "teacher123",
  },
  student: {
    email: "alice.williams@campus.edu",
    password: "student123",
  },
  cr: {
    email: "david.brown@campus.edu",
    password: "cr123",
  },
  alumni: {
    email: "robert.taylor@alumni.campus.edu",
    password: "alumni123",
  },
};
