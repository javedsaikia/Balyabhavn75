# Supabase Integration Guide

This document provides instructions for setting up and using the Supabase integration in the Diamond Anniversary Design application.

## Overview

The application now supports dual authentication modes:
- **Supabase Authentication**: Secure, cloud-based authentication with PostgreSQL database
- **In-Memory Authentication**: Fallback system for development and testing

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key

### 2. Environment Configuration

Update your `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Connection Control
SUPABASE_CONNECTION_ENABLED=true

# JWT Secret (keep existing)
JWT_SECRET=your_jwt_secret

# Environment
NODE_ENV=development
```

### 3. Database Schema Setup

Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the SQL commands

This will create:
- `users` table with proper structure
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- Functions for registration statistics

## Features

### Connection Management

Administrators can manage the Supabase connection through the admin dashboard:

- **Connection Status**: View current connection state
- **Enable/Disable**: Toggle between Supabase and in-memory authentication
- **Test Connection**: Verify Supabase connectivity
- **Real-time Updates**: Connection status updates automatically

### Authentication Flow

#### With Supabase Enabled:
1. User registration creates accounts in Supabase Auth
2. User profiles are stored in the `users` table
3. Authentication uses Supabase sessions
4. Middleware validates Supabase tokens

#### With Supabase Disabled (Fallback):
1. Uses in-memory user storage
2. JWT-based authentication
3. Local session management

### User Management

- **Registration**: Automatic user creation with capacity limits
- **Status Management**: Admin can activate/suspend users
- **Role-based Access**: Support for admin and user roles
- **Statistics**: Real-time registration and user statistics

## API Endpoints

### Connection Management
- `GET /api/connection/status` - Check connection status
- `POST /api/connection/toggle` - Enable/disable Supabase connection

### Authentication (existing)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/stats` - Registration statistics

### User Management (existing)
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/[id]/status` - Update user status (admin only)

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Admins have elevated permissions
- Service role bypasses RLS for admin operations

### Environment Security
- Sensitive keys stored in environment variables
- Service role key never exposed to client
- Automatic token validation and refresh

## Troubleshooting

### Connection Issues
1. Verify Supabase credentials in `.env.local`
2. Check network connectivity
3. Ensure Supabase project is active
4. Review browser console for errors

### Authentication Problems
1. Clear browser cookies and local storage
2. Verify user exists in Supabase Auth dashboard
3. Check RLS policies are properly configured
4. Ensure user profile exists in `users` table

### Database Issues
1. Verify schema is properly created
2. Check RLS policies are enabled
3. Ensure triggers are functioning
4. Review Supabase logs for errors

## Development Notes

- The application gracefully falls back to in-memory auth if Supabase is unavailable
- Connection status can be toggled without restarting the application
- All existing functionality remains compatible
- Middleware handles both authentication methods seamlessly

## Migration from In-Memory to Supabase

1. Set up Supabase project and database schema
2. Configure environment variables
3. Enable Supabase connection via admin dashboard
4. Existing users will need to re-register with Supabase
5. Admin accounts should be created first in Supabase

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check application logs and browser console
4. Verify environment configuration