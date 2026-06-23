# LMS Platform

A full-stack Learning Management System built with a Node.js + Express backend and a React + Vite frontend.

## Overview

This repository contains two main apps:

- `backend/` — Express REST API with authentication, course and assignment management, enrollments, wishlists, certificates, admin/instructor/student routes, file uploads, Prisma ORM, Redis, and backup/email utilities.
- `frontend/` — React application using Vite, Tailwind CSS, React Router, React Query, Axios, and role-based protected routes for students, instructors, and admins.

## Architecture

- Backend: `backend/server.js` bootstraps the API, applies middleware, serves uploads, configures rate limiting, and mounts route modules under `/api/*`.
- Frontend: `frontend/src/App.jsx` defines public routes and authenticated layouts for all user roles.
- Shared data model: `backend/prisma/schema.prisma` defines users, courses, modules, assignments, enrollments, wishlist, reviews, notifications, and certificates.

## Backend Details

### Tech stack
- Node.js
- Express
- Prisma
- PostgreSQL / any Prisma-supported database
- Redis
- JWT authentication
- Multer file uploads
- Express-validator request validation
- Helmet, compression, CORS, rate limiting
- Nodemailer email support

### Key backend dependencies
- `express`
- `@prisma/client`, `prisma`
- `bcryptjs`
- `jsonwebtoken`
- `multer`
- `helmet`
- `compression`
- `cors`
- `express-rate-limit`
- `express-validator`
- `ioredis`
- `nodemailer`
- `pdfkit`

### Startup
- `npm install`
- `npm run dev` — development server with nodemon
- `npm start` — production server
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run prisma:reset`

### Environment variables
Create `backend/.env` with values similar to:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/lms"
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_email_password
```

### Backend routes

#### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

#### Courses
- `GET /api/courses` — list courses with optional paging, search, instructor filters
- `GET /api/courses/:id` — course details
- `POST /api/courses` — create course (instructor)
- `PUT /api/courses/:id` — update course (instructor)
- `DELETE /api/courses/:id` — delete course (instructor)
- `POST /api/courses/recover/:id` — recover course (instructor)

#### Assignments
- `GET /api/assignments/my-assignments` — student assignment list
- `GET /api/assignments/:id` — assignment details
- `POST /api/assignments/:id/submit` — submit assignment with file upload
- `POST /api/assignments/course/:courseId/create` — create assignment (instructor)
- `GET /api/assignments/:assignmentId/submissions` — instructor view submissions
- `PUT /api/assignments/:assignmentId/grade` — grade assignment

#### Enrollment
- `POST /api/enrollments/enroll` — enroll in a course
- `DELETE /api/enrollments/unenroll/:courseId` — unenroll from course
- `GET /api/enrollments/my-courses` — student enrolled courses
- `PUT /api/enrollments/progress` — update course progress

#### Student features
- `GET /api/student/dashboard/stats`
- `GET /api/student/dashboard/recent-activity`
- `GET /api/student/my-courses`
- `GET /api/student/courses/:id/progress`
- `POST /api/student/courses/:id/complete-module`
- `GET /api/student/assignments`
- `POST /api/student/assignments/:id/submit`
- `GET /api/student/progress/overall`
- `GET /api/student/certificates`
- `POST /api/student/courses/:id/certificate`
- `GET /api/student/wishlist`
- `POST /api/student/wishlist`
- `DELETE /api/student/wishlist/:courseId`
- `POST /api/student/courses/:id/review`
- `GET /api/student/courses/:id/reviews`
- `GET /api/student/notifications`
- `PUT /api/student/notifications/:id/read`
- `PUT /api/student/notifications/read-all`
- `PUT /api/student/profile`
- `POST /api/student/avatar`
- `GET /api/student/statistics`

#### Wishlist
- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist/:courseId`
- `GET /api/wishlist/check/:courseId`

#### Instructor features
- `GET /api/instructor/dashboard/stats`
- `GET /api/instructor/dashboard/recent-activity`
- `GET /api/instructor/courses`
- `GET /api/instructor/courses/:id`
- `POST /api/instructor/courses`
- `PUT /api/instructor/courses/:id`
- `DELETE /api/instructor/courses/:id`
- `POST /api/instructor/courses/:id/publish`
- `POST /api/instructor/courses/:id/archive`
- `POST /api/instructor/courses/:courseId/modules`
- `PUT /api/instructor/modules/:moduleId`
- `DELETE /api/instructor/modules/:moduleId`
- `GET /api/instructor/courses/:courseId/students`
- `GET /api/instructor/students/:studentId/progress`
- `GET /api/instructor/students/:studentId/assignments`
- `POST /api/instructor/courses/:courseId/assignments`
- `GET /api/instructor/assignments/:assignmentId/submissions`
- `PUT /api/instructor/submissions/:submissionId/grade`
- `GET /api/instructor/analytics/overview`
- `GET /api/instructor/analytics/course/:courseId`
- `POST /api/instructor/courses/:courseId/announcement`

#### Admin features
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/analytics/users`
- `GET /api/admin/analytics/courses`
- `GET /api/admin/analytics/revenue`
- `GET /api/admin/analytics/engagement`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PUT /api/admin/users/:id/role`
- `PUT /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/:id/reset-password`
- `GET /api/admin/courses`
- `GET /api/admin/courses/:id`
- `PUT /api/admin/courses/:id`
- `DELETE /api/admin/courses/:id`
- `POST /api/admin/courses/:id/recover`
- `POST /api/admin/courses/:id/feature`
- `POST /api/admin/courses/:id/unfeature`
- `GET /api/admin/system/health`
- `GET /api/admin/system/logs`
- `POST /api/admin/system/backup`
- `POST /api/admin/system/maintenance`
- `GET /api/admin/reports/users`
- `GET /api/admin/reports/courses`
- `GET /api/admin/reports/assignments`
- `POST /api/admin/notifications`

### Uploads and storage
The backend stores uploads under `backend/uploads/` with subfolders:
- `assignments/`
- `avatars/`
- `certificates/`
- `thumbnails/`

The upload middleware accepts:
- assignment files: PDF, DOC, DOCX, ZIP (up to 200MB)
- images: JPEG, PNG, GIF, WEBP, SVG (up to 5MB)

### Prisma data model

Key models from `backend/prisma/schema.prisma`:
- `User` — email, password, name, role, avatar, bio, enrollments, wishlist, notifications
- `Course` — title, description, instructor, category, featured, modules, assignments, reviews
- `Module` — course content, video URL, order
- `Assignment` — course assignment, file info, grade, feedback
- `Certificate` — issued course certificate files
- `Wishlist` — student course wishlist
- `Review` — course ratings/comments
- `Notification` — user notifications
- `UserCourse` — course enrollment/progress

## Frontend Details

### Tech stack
- React
- Vite
- Tailwind CSS
- React Router DOM
- React Query
- Axios
- React Hot Toast
- Headless UI
- Heroicons

### Startup
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Environment
Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

### Key frontend files
- `frontend/src/App.jsx` — app routing and layout assignment
- `frontend/src/services/api.js` — Axios client and auth interceptors
- `frontend/src/context/AuthContext.jsx` — auth provider, login/register/logout, current user fetch
- `frontend/src/components/ProtectedRoute.jsx` — route protection and role-based access
- `frontend/src/layouts/` — role-specific pages and sidebar layouts
- `frontend/src/pages/` — UI pages for home, courses, login, register, profile, admin, instructor, and student workflows

### Pages and routes
Public pages:
- `/login`
- `/register`
- `/`
- `/courses`
- `/courses/:id`

Authenticated pages:
- `/my-courses`
- `/assignments`
- `/upload-assignment/:courseId`
- `/profile`

Admin pages:
- `/admin`
- `/admin/users`
- `/admin/courses`
- `/admin/analytics`
- `/admin/settings`

Instructor pages:
- `/instructor`
- `/instructor/courses`
- `/instructor/courses/create`
- `/instructor/courses/:id`
- `/instructor/students`
- `/instructor/students/:id`
- `/instructor/assignments`
- `/instructor/analytics`
- `/instructor/settings`

Student pages:
- `/student`
- `/student/courses`
- `/student/courses/:id`
- `/student/assignments`
- `/student/assignments/:id/submit`
- `/student/progress`
- `/student/wishlist`
- `/student/settings`
- `/student/certificates`

### Frontend features
- JWT authentication persisted in `localStorage`
- auto-login from token and `/auth/me` fetch
- protected routes for auth and role restrictions
- API error fallback that redirects unauthorized users to login
- responsive layouts for admin, instructor, student, and main site pages
- course search/paging, assignments upload, certificates, progress tracking, wishlist, reviews, and stats panels

## Folder structure

- `backend/`
  - `controllers/` — request handlers for each domain
  - `routes/` — Express route definitions
  - `middleware/` — auth, validation, and uploads
  - `lib/` — Prisma and Redis clients
  - `prisma/` — schema, migrations, seed data
  - `utils/` — backup and email utilities
  - `uploads/` — stored uploaded files

- `frontend/`
  - `src/` — React app source
  - `src/components/` — shared components
  - `src/context/` — auth state provider
  - `src/layouts/` — layouts for all user roles
  - `src/pages/` — route pages and app screens
  - `src/services/` — API client

## Running locally

1. Start backend
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```

2. Start frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open the app
   - frontend: `http://localhost:5173`
   - backend API: `http://localhost:5000/api`

## Notes

- `backend/server.js` serves uploads from `/uploads` and `/api/uploads`.
- `backend/middleware/auth.js` protects routes and checks instructor/admin roles.
- `backend/middleware/upload.js` manages uploads and automatically creates upload directories.
- `backend/utils/backup.js` can create, list, and restore backups using `pg_dump` for PostgreSQL or JSON fallback for other databases.
- `backend/utils/email.js` contains mailing templates for welcome, enrollment, password reset, grade notifications, and assignment submissions.

## Contact
For customization, extend controllers and route handlers under `backend/`, and update pages/components in `frontend/src/`.
