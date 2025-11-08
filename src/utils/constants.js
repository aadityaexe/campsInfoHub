/**
 * Application-wide constants
 */

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  CR: 'cr',
  ALUMNI: 'alumni',
};

// Status types
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Item types for Lost & Found
export const ITEM_TYPES = {
  LOST: 'lost',
  FOUND: 'found',
};

// Notification types
export const NOTIFICATION_TYPES = {
  ASSIGNMENT: 'assignment',
  NOTICE: 'notice',
  LOSTFOUND: 'lostfound',
};

// Route paths by role
export const ROLE_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.TEACHER]: '/teacher',
  [USER_ROLES.STUDENT]: '/student',
  [USER_ROLES.CR]: '/cr',
  [USER_ROLES.ALUMNI]: '/alumni',
};

// Date formatting
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  DATETIME: 'MM/DD/YYYY HH:mm',
};

