# Quick Setup Guide for Google Authentication

You're seeing the "Google authentication is not available" message because Supabase is not configured. Here's how to fix it:

## Option 1: Enable Google Authentication (Recommended)

### Step 1: Set up Supabase
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API and copy:
   - Project URL
   - Anon (public) key
   - Service role key

### Step 2: Configure Environment Variables
Update your `.env.local` file by uncommenting and filling in these values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Connection Control
SUPABASE_CONNECTION_ENABLED=true
```

### Step 3: Set up Database Schema
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL commands from `supabase-schema.sql`

### Step 4: Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://your-supabase-project.supabase.co/auth/v1/callback`
4. In Supabase Dashboard > Authentication > Providers:
   - Enable Google provider
   - Add your Google Client ID and Secret

### Step 5: Restart Development Server
```bash
npm run dev
```

## Option 2: Use Email Authentication Only

If you prefer to skip Google authentication for now:

1. Use the email login form on the main page
2. Register new users via the "Register New User" link
3. The application will work with JWT-based authentication

## Current Status

✅ **Working Features:**
- Email/password authentication
- User registration
- Admin dashboard
- Event management
- Connection status monitoring

⚠️ **Requires Setup:**
- Google OAuth authentication
- Supabase database integration

## Need Help?

Refer to the detailed guides:
- `SUPABASE_INTEGRATION.md` - Complete Supabase setup
- `GOOGLE_OAUTH_SETUP.md` - Detailed Google OAuth configuration

## Quick Test

To test email authentication right now:
1. Click "Register New User" on the login page
2. Fill out the registration form
3. Use those credentials to log in

The application is fully functional with email authentication - Google OAuth is just an additional convenience feature.