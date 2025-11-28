# React Frontend - Healthcare Staff Management System

A complete React frontend application with Context API for authentication and staff management operations.

## 📋 Features Implemented

✅ **Authentication Context API** - Global state management for login/logout  
✅ **Protected Routes** - Route protection based on authentication  
✅ **Login Page** - Email/password authentication with validation  
✅ **Register Page** - Admin account creation  
✅ **Dashboard** - Overview with today's shifts and key metrics  
✅ **Shift Management** - Create, list, and filter shifts  
✅ **Staff Assignment** - Assign staff to shifts with validation  
✅ **Attendance Tracking** - Mark staff present/absent  
✅ **Responsive Design** - Mobile-friendly Tailwind CSS styling  
✅ **Error Handling** - Comprehensive error messages and validation

## 🛠️ Tech Stack

- **React 19.2.0** - UI framework
- **React Router DOM 7.9.6** - Client-side routing
- **Axios 1.13.2** - HTTP client for API calls
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Context API** - State management (built-in to React)

## 📦 Installation & Setup

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher
- Backend API running on `http://localhost:5000`

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Verify Backend Configuration

The frontend is configured to communicate with the backend at `http://localhost:5000/api`.
Edit `src/services/api.js` if your backend runs on a different port:

```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

### Step 3: Start the Frontend

```bash
npm start
```

The application will open automatically at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML entry point
│   └── manifest.json       # PWA manifest
├── src/
│   ├── pages/
│   │   ├── Login.js        # Login page with form validation
│   │   ├── Register.js     # Admin registration page
│   │   ├── Dashboard.js    # Main dashboard with stats
│   │   ├── CreateShift.js  # Create new shifts
│   │   ├── ShiftList.js    # List and filter shifts
│   │   ├── AssignStaff.js  # Assign staff to shifts
│   │   └── Attendance.js   # Mark attendance
│   ├── context/
│   │   └── AuthContext.js  # Authentication context & hooks
│   ├── services/
│   │   └── api.js          # Axios API client with interceptors
│   ├── App.js              # Main app with routing
│   ├── styles.css          # Global styles
│   ├── index.js            # React entry point
│   └── setupTests.js       # Test setup
├── package.json
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── .gitignore
```

## 🔐 Authentication Flow

### Context API (AuthContext.js)

The authentication state is managed globally using React Context API:

```javascript
import { useAuth } from "./context/AuthContext";

const MyComponent = () => {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  // Use auth methods and state
};
```

### Key Methods

- `login(email, password)` - Authenticate user
- `register(email, password, firstName, lastName)` - Create new admin account
- `logout()` - Clear auth state and localStorage
- `isAuthenticated` - Boolean flag for auth status

### Token Management

- Tokens are stored in `localStorage` under the key `token`
- User data is stored in `localStorage` under the key `user`
- Axios interceptors automatically add `Authorization: Bearer <token>` to requests
- 401 responses trigger automatic logout and redirect to login

## 📡 API Integration

### Shift API (`src/services/api.js`)

```javascript
import { shiftAPI } from "../services/api";

// Create shift
await shiftAPI.createShift({ date, type, capacity });

// List shifts with optional date filter
await shiftAPI.listShifts(date); // date is optional

// Get single shift
await shiftAPI.getShiftById(id);
```

### Assignment API

```javascript
import { assignmentAPI } from "../services/api";

// Assign staff to shift
await assignmentAPI.assignStaff({ shiftId, staffId });

// List assignments for a shift
await assignmentAPI.listAssignments(shiftId);
```

### Attendance API

```javascript
import { attendanceAPI } from "../services/api";

// Mark attendance
await attendanceAPI.markAttendance({ shiftId, staffId, status });

// Get attendance for shift
await attendanceAPI.getAttendanceByShift(shiftId);
```

### Dashboard API

```javascript
import { dashboardAPI } from "../services/api";

// Get dashboard summary
await dashboardAPI.getDashboard();
```

## 🎨 UI Components & Pages

### Login Page (`src/pages/Login.js`)

- Email and password input fields
- Client-side form validation
- Error message display
- Link to registration page
- Demo credentials shown for testing

### Register Page (`src/pages/Register.js`)

- First name, last name, email, password fields
- Password confirmation validation
- Form validation before submission
- Automatic login after successful registration

### Dashboard (`src/pages/Dashboard.js`)

- Welcome message with user info
- Stats cards: Total Staff, Assigned Today, Attendance Rate, Today's Shifts
- Today's shifts grid with progress bars
- Quick access to assign staff and mark attendance
- Logout button in header

### Create Shift (`src/pages/CreateShift.js`)

- Date picker (prevents past dates)
- Shift type dropdown (Morning/Afternoon/Night)
- Capacity input with validation
- Success feedback and auto-redirect

### Shift List (`src/pages/ShiftList.js`)

- Table display of all shifts
- Filter shifts by date
- Show capacity vs assigned staff
- Available slots count
- Action buttons: Assign Staff, Mark Attendance

### Assign Staff (`src/pages/AssignStaff.js`)

- Dropdown with available staff members
- List of already-assigned staff
- Prevents double-assignment to same shift on same date
- Real-time update of assigned staff list

### Attendance (`src/pages/Attendance.js`)

- Mark each assigned staff as Present/Absent
- Visual indicators for present/absent counts
- Save all attendance records at once
- Prevents duplicate attendance records

## 🔒 Form Validation

All forms include client-side validation:

- **Email**: Valid email format required
- **Password**: Minimum 6 characters
- **Dates**: Cannot select past dates for shifts
- **Numbers**: Capacity between 1-100
- **Passwords**: Confirmation matches original

Server-side validation is enforced by the backend API.

## 🎯 User Workflows

### Workflow 1: Create & Manage Shifts

1. **Login** → Enter credentials
2. **Dashboard** → View today's shifts
3. **Create Shift** → Set date, type, capacity
4. **Manage Shifts** → View all shifts, filter by date
5. **Assign Staff** → Select staff for specific shifts
6. **Mark Attendance** → Record present/absent

### Workflow 2: Admin Registration

1. **Register** → Create new admin account
2. **Automatically logged in** → Redirected to dashboard
3. **Start managing shifts** → All features available

## 🌐 CORS & API Communication

The frontend communicates with the backend API using Axios with the following setup:

- **Base URL**: `http://localhost:5000/api`
- **Headers**: `Content-Type: application/json`
- **Authorization**: `Bearer <JWT_TOKEN>` (auto-added via interceptor)

**CORS Configuration**: Ensure backend allows requests from `http://localhost:3000`

## 🐛 Troubleshooting

### Cannot login - "Failed to connect to backend"

**Solution**: Verify backend is running on `http://localhost:5000`

```bash
# Test backend connection
curl http://localhost:5000/api/health
```

### "401 Unauthorized" after login

**Solution**:

- Token might be expired (logout and re-login)
- Check `JWT_SECRET` matches between frontend localStorage and backend
- Verify Authorization header format: `Bearer <token>`

### Styles not loading

**Solution**: Ensure Tailwind CSS is processed:

```bash
npm run build  # Generate Tailwind CSS
```

### "Cannot assign staff" - Duplicate assignment error

**Solution**: Staff member is already assigned to a shift on the same date. Choose different staff or date.

### localStorage errors

**Solution**:

- Clear browser cache: DevTools → Application → Clear Site Data
- Or use Incognito/Private window

## 📚 Development Tips

### Enable Console Logging

Add debug info in development:

```javascript
if (process.env.NODE_ENV === "development") {
  console.log("Auth state:", { user, token, isAuthenticated });
}
```

### Test Context API Usage

```javascript
import { useAuth } from "./context/AuthContext";

// Inside any component
const { user, isAuthenticated, logout } = useAuth();
```

### Custom Axios Instance

Modify `src/services/api.js` to customize API behavior:

```javascript
API.interceptors.request.use((config) => {
  // Add custom headers, logging, etc.
  return config;
});
```

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Environment Variables for Production

Create a `.env.production` file:

```env
REACT_APP_API_URL=https://api.yourdomain.com
```

Update `src/services/api.js`:

```javascript
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
```

## 📝 Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from create-react-app (irreversible)

## 🔄 State Management Patterns

### Login Flow

```javascript
const { login } = useAuth();

// In component
const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    // Navigate to dashboard
  }
};
```

### Protected Routes

Routes are protected using a custom `ProtectedRoute` component that checks `isAuthenticated`:

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Using Auth in Components

```javascript
import { useAuth } from "./context/AuthContext";

const MyComponent = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## 🎨 Styling

The application uses **Tailwind CSS** for styling with custom utilities in `src/styles.css`:

- `.gradient-primary` - Blue to purple gradient
- `.gradient-card` - White to light blue gradient
- `.transition-all` - Smooth transitions
- `.shadow-lg-blue` - Blue-tinted shadow

All components are responsive and work on mobile, tablet, and desktop.

## 📊 Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── BrowserRouter
│       └── Routes
│           ├── PublicRoute
│           │   ├── Login
│           │   └── Register
│           └── ProtectedRoute
│               ├── Dashboard
│               ├── CreateShift
│               ├── ShiftList
│               ├── AssignStaff
│               └── Attendance
```

## 🤝 Integration with Backend

Ensure backend provides these endpoints:

| Method | Endpoint                    | Auth |
| ------ | --------------------------- | ---- |
| POST   | `/api/auth/login`           | ❌   |
| POST   | `/api/auth/register`        | ❌   |
| POST   | `/api/shifts`               | ✅   |
| GET    | `/api/shifts`               | ✅   |
| POST   | `/api/assignments`          | ✅   |
| GET    | `/api/assignments`          | ✅   |
| POST   | `/api/attendance`           | ✅   |
| GET    | `/api/attendance/shift/:id` | ✅   |
| GET    | `/api/dashboard`            | ✅   |
| GET    | `/api/staff`                | ✅   |

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues or questions:

1. Check the Troubleshooting section
2. Review browser console for error messages
3. Verify backend API is running and accessible
4. Check network tab in DevTools for API response errors

---

**Last Updated**: November 28, 2025  
**Version**: 1.0.0  
**React Version**: 19.2.0  
**Tailwind CSS Version**: 3.4.1
