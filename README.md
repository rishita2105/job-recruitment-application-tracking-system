# Job Recruitment System — Authentication Milestone

This version includes:

- Candidate and recruiter registration
- Secure password hashing with bcrypt
- Login with a JWT stored in an HTTP-only cookie
- Logout
- Current-user endpoint: `GET /api/auth/me`
- Blocked-user checks
- Reusable backend role authorization middleware
- React authentication context
- Candidate, recruiter, and admin protected routes
- Admin seed script

## 1. Configure the server

Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7
NODE_ENV=development
ADMIN_NAME=Platform Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use_a_secure_admin_password
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 2. Run the backend

```bash
cd server
npm install
npm run dev
```

## 3. Run the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## 4. Create the admin once

Make sure the backend environment is configured, then run:

```bash
cd server
npm run seed:admin
```

Admin registration is deliberately unavailable through the public form.

## Authentication endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Logged-in user |

### Candidate registration body

```json
{
  "name": "Rishita Polavarapu",
  "email": "candidate@example.com",
  "password": "Candidate@123",
  "role": "candidate"
}
```

### Recruiter registration body

```json
{
  "name": "Test Recruiter",
  "email": "recruiter@example.com",
  "password": "Recruiter@123",
  "role": "recruiter"
}
```

## Protected frontend routes

- Candidate: `/candidate/dashboard`
- Recruiter: `/recruiter/dashboard`
- Admin: `/admin/dashboard`

A logged-out visitor is redirected to login. A logged-in user with the wrong
role is redirected to `/unauthorized`.

## Applying role authorization to future backend routes

```js
router.post(
  "/jobs",
  authenticate,
  authorizeRoles("recruiter"),
  createJob,
);
```

```js
router.get(
  "/admin/users",
  authenticate,
  authorizeRoles("admin"),
  getAllUsers,
);
```
