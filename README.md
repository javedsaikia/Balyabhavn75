# Alumni Event Registration System

A comprehensive alumni event registration application with secure authentication and admin management.

## Features

- **Dual Authentication System**: Separate login flows for users and administrators
- **User Registration**: Support for up to 1000 alumni registrations with capacity tracking
- **Admin Dashboard**: Complete user management with status updates and data export
- **Event Management**: Event listing and registration with payment integration
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Responsive Design**: Beautiful glassmorphism UI optimized for desktop and mobile

## Environment Setup

1. Copy the environment template:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Configure the required environment variables in `.env.local`:

   ### Required Variables:
   - `JWT_SECRET`: A secure secret key for JWT token signing
     - Generate using: `openssl rand -base64 32`
     - Or use any secure random string generator
   
   - `NODE_ENV`: Set to `development` for local development, `production` for deployment

   ### Example:
   \`\`\`env
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   NODE_ENV=development
   \`\`\`

## Default Login Credentials

### Admin Access:


### Test User:


## Security Notes

- The current implementation uses in-memory storage for demonstration
- In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
- Ensure JWT_SECRET is a strong, unique value in production
- All passwords are hashed using bcrypt with salt rounds of 12

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see above)
3. Run development server: `npm run dev`
4. Access the application at `http://localhost:3000`

## Authentication Flow

- **Users**: Register through `/register-user` or login at `/`
- **Admins**: Login at `/admin/login` with admin credentials
- **Protected Routes**: Middleware automatically handles authentication and authorization
