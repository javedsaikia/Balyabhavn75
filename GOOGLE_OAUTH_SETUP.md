# Google OAuth Setup Guide

This guide explains how to configure Google OAuth authentication for the Alumni Event Registration System using Supabase.

## Prerequisites

- Supabase project set up and configured
- Google Cloud Console account
- Domain or localhost for testing

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the following:

   **Name**: `Alumni System OAuth Client`
   
   **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
   
   **Authorized redirect URIs**:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development testing)

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase Authentication

### 2.1 Enable Google Provider
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and click to configure
4. Enable the Google provider
5. Enter your Google OAuth credentials:
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console

### 2.2 Configure Redirect URLs
1. In the same Google provider settings, ensure the redirect URL is set to:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```

### 2.3 Configure Site URL
1. Go to **Authentication** > **URL Configuration**
2. Set the **Site URL** to:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)

## Step 3: Update Environment Variables

Ensure your `.env.local` file includes:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_CONNECTION_ENABLED=true

# JWT Configuration (for fallback auth)
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

## Step 4: Database Schema

Ensure your Supabase database has the required `users` table:

```sql
-- Users table for storing user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  batch TEXT,
  department TEXT,
  phone TEXT,
  address TEXT,
  year_of_passing TEXT,
  registration_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow public insert for new user registration
CREATE POLICY "Allow public insert for new users" ON users
  FOR INSERT WITH CHECK (true);
```

## Step 5: Testing the Integration

### 5.1 Development Testing
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Continue with Google"
4. Complete the Google OAuth flow
5. Verify you're redirected back to the application
6. Check that your user profile is created in the Supabase `users` table

### 5.2 Troubleshooting

**Common Issues:**

1. **"redirect_uri_mismatch" error**:
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client" error**:
   - Verify Client ID and Client Secret are correct
   - Ensure the Google+ API is enabled

3. **User profile not created**:
   - Check Supabase logs for database errors
   - Verify the `users` table exists and has correct permissions
   - Check that RLS policies allow insertion

4. **Authentication state not persisting**:
   - Verify Supabase client configuration
   - Check that `SUPABASE_CONNECTION_ENABLED=true`

## Step 6: Production Deployment

### 6.1 Update Google OAuth Settings
1. Add your production domain to **Authorized JavaScript origins**
2. Add your production callback URL to **Authorized redirect URIs**

### 6.2 Update Supabase Settings
1. Update the **Site URL** in Supabase to your production domain
2. Ensure environment variables are set in your production environment

### 6.3 Security Considerations
- Never expose your `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Use HTTPS in production
- Regularly rotate your JWT secret
- Monitor authentication logs for suspicious activity

## Features Implemented

✅ **Google OAuth Sign-in**: Users can sign in with their Google accounts
✅ **Automatic Profile Creation**: User profiles are automatically created from Google account data
✅ **Session Management**: Supabase handles session persistence and refresh
✅ **Fallback Authentication**: System falls back to JWT auth if Supabase is disabled
✅ **Real-time Auth State**: Authentication state updates in real-time across the app
✅ **Role-based Access**: Support for user and admin roles
✅ **Secure Logout**: Proper cleanup of both Supabase and JWT sessions

## Next Steps

- Configure additional OAuth providers (Facebook, GitHub, etc.)
- Implement email verification for OAuth users
- Add profile completion flow for new OAuth users
- Set up email notifications for new registrations