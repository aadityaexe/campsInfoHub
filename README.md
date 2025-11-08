# Smart Campus Management System

A full-featured React + Vite + Tailwind CSS frontend for managing campus operations with role-based access control.

## Features

- 🔐 Authentication with JWT tokens
- 👥 Role-based access (Admin, Teacher, Student, CR, Alumni)
- 📢 Notice management
- 📚 Course management
- 📝 Assignment system
- ✅ Attendance tracking
- 🔍 Lost & Found system
- 📱 Fully responsive design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Context API** - State management

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
  api/           # API configuration and endpoints
  assets/        # Static assets
  components/    # Reusable components
    layout/      # Layout components (Navbar, Sidebar)
    ui/          # UI components (Button, Card, Table, Loader)
  contexts/      # React contexts (AuthContext)
  hooks/         # Custom hooks (useAuth)
  pages/         # Page components
    Admin/       # Admin pages
    Alumni/      # Alumni pages
    Assignments/ # Assignment pages
    Attendance/  # Attendance pages
    Auth/        # Authentication pages
    Courses/     # Course pages
    Dashboards/  # Dashboard pages
    LostFound/   # Lost & Found pages
    Notices/     # Notice pages
    Student/     # Student pages
    Teacher/     # Teacher pages
  routes/        # Routing configuration
  App.jsx        # Main app component
  main.jsx       # Entry point
```

## User Roles

### Admin
- Manage users, notices, courses, and lost & found items
- Full system access

### Teacher
- Manage courses and assignments
- View attendance records
- Create notices

### Student
- View courses and enroll
- Submit assignments
- View notices

### Class Representative (CR)
- Mark attendance
- View notices

### Alumni
- Access alumni network
- View campus notices

## API Integration

The app expects a REST API with the following endpoints:

- `/api/auth/login` - POST
- `/api/auth/register` - POST
- `/api/users` - GET, POST, PUT, DELETE
- `/api/notices` - GET, POST, PUT, DELETE
- `/api/courses` - GET, POST, PUT, DELETE
- `/api/assignments` - GET, POST, PUT, DELETE
- `/api/attendance` - GET, POST, PUT
- `/api/lost-found` - GET, POST, PUT, DELETE

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:5000/api)
- `VITE_USE_MOCK_API` - Set to `'true'` to force mock API usage (optional)

## Mock API / No Backend Required

**The app works fully without a backend!** By default, the app uses mock APIs when `VITE_API_BASE_URL` is not set.

### Features:
- ✅ **Full functionality** - All features work with mock data
- ✅ **Realistic delays** - Simulates network latency (500-1000ms)
- ✅ **Error simulation** - Random errors (5% chance) to test error handling
- ✅ **Persistent data** - Data persists during session (stored in memory)
- ✅ **Easy backend swap** - Just set `VITE_API_BASE_URL` to switch to real backend

### Mock Data:
All mock data is stored in `src/mockData/`:
- `users.js` - User accounts for all roles
- `notices.js` - Campus notices
- `courses.js` - Course catalog
- `assignments.js` - Assignments and submissions
- `attendance.js` - Attendance records
- `lostFound.js` - Lost & found items

### Switching to Real Backend:
1. Set `VITE_API_BASE_URL` in `.env` file
2. The app will automatically use real API calls
3. All existing code works without changes

## Test Users (Development)

For testing purposes, the following dummy users are available:

### Admin
- **Email:** `admin@campus.edu`
- **Password:** `admin123`

### Teacher
- **Email:** `sarah.johnson@campus.edu`
- **Password:** `teacher123`

### Student
- **Email:** `alice.williams@campus.edu`
- **Password:** `student123`

### Class Representative (CR)
- **Email:** `david.brown@campus.edu`
- **Password:** `cr123`

### Alumni
- **Email:** `robert.taylor@alumni.campus.edu`
- **Password:** `alumni123`

**Note:** In development mode, you'll see:
- A quick login helper widget (bottom-right corner) for instant login
- Test credentials displayed on the login page (click to auto-fill)

## License

MIT

