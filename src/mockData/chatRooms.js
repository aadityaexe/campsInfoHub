// Mock chat rooms data
// Chat rooms are dynamically created based on:
// 1. Course group chats (all enrolled students)
// 2. Private chats (student-teacher, student-CR)
// 3. Course-specific private chats

export const mockChatRooms = [
  // Course Group Chats
  {
    _id: 'room_course1_group',
    id: 'room_course1_group',
    type: 'course_group',
    courseId: 'course1',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS101',
    participants: ['student1', 'student2', 'student3'],
    instructorId: 'teacher1',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    _id: 'room_course2_group',
    id: 'room_course2_group',
    type: 'course_group',
    courseId: 'course2',
    courseName: 'Calculus I',
    courseCode: 'MATH101',
    participants: ['student1', 'student2'],
    instructorId: 'teacher2',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    _id: 'room_course3_group',
    id: 'room_course3_group',
    type: 'course_group',
    courseId: 'course3',
    courseName: 'Data Structures',
    courseCode: 'CS201',
    participants: ['student1', 'student3'],
    instructorId: 'teacher1',
    createdAt: '2024-01-15T00:00:00Z',
  },
  
  // Private Student-Teacher Chats
  {
    _id: 'room_student1_teacher1',
    id: 'room_student1_teacher1',
    type: 'private',
    participants: ['student1', 'teacher1'],
    courseId: null,
    courseName: null,
    createdAt: '2024-01-16T00:00:00Z',
  },
  {
    _id: 'room_student2_teacher1',
    id: 'room_student2_teacher1',
    type: 'private',
    participants: ['student2', 'teacher1'],
    courseId: null,
    courseName: null,
    createdAt: '2024-01-16T00:00:00Z',
  },
  {
    _id: 'room_student1_teacher2',
    id: 'room_student1_teacher2',
    type: 'private',
    participants: ['student1', 'teacher2'],
    courseId: null,
    courseName: null,
    createdAt: '2024-01-16T00:00:00Z',
  },
  
  // Private Student-CR Chats
  {
    _id: 'room_student1_cr1',
    id: 'room_student1_cr1',
    type: 'private',
    participants: ['student1', 'cr1'],
    courseId: null,
    courseName: null,
    createdAt: '2024-01-17T00:00:00Z',
  },
  {
    _id: 'room_student2_cr1',
    id: 'room_student2_cr1',
    type: 'private',
    participants: ['student2', 'cr1'],
    courseId: null,
    courseName: null,
    createdAt: '2024-01-17T00:00:00Z',
  },
  
  // Course-Specific Private Chats (Student-Instructor for specific course)
  {
    _id: 'room_student1_course1_private',
    id: 'room_student1_course1_private',
    type: 'course_private',
    courseId: 'course1',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS101',
    participants: ['student1', 'teacher1'],
    createdAt: '2024-01-18T00:00:00Z',
  },
  {
    _id: 'room_student2_course1_private',
    id: 'room_student2_course1_private',
    type: 'course_private',
    courseId: 'course1',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS101',
    participants: ['student2', 'teacher1'],
    createdAt: '2024-01-18T00:00:00Z',
  },
  {
    _id: 'room_student1_course2_private',
    id: 'room_student1_course2_private',
    type: 'course_private',
    courseId: 'course2',
    courseName: 'Calculus I',
    courseCode: 'MATH101',
    participants: ['student1', 'teacher2'],
    createdAt: '2024-01-18T00:00:00Z',
  },
];

