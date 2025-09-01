# Quick Fix: Google Authentication Not Available

## Problem
You're seeing "Google authentication is not available. Please configure Supabase or use email login." because Supabase is not configured.

## Root Cause
The Supabase environment variables in `.env.local` are commented out, so the application cannot connect to Supabase for Google OAuth.

## Solution Options

### Option 1: Enable Google Authentication (Recommended)

#### Step 1: Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project or use existing project
3. Go to **Settings** > **API**
4. Copy these values:
   - **Project URL** (starts with `https://`)
   - **Anon (public) key** (starts with `eyJ`)
   - **Service role key** (starts with `eyJ`)

#### Step 2: Update Environment Variables
Edit your `.env.local` file and uncomment/update these lines:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Connection Control
SUPABASE_CONNECTION_ENABLED=true
```

#### Step 3: Set Up Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Run the SQL from `supabase-schema.sql` file

#### Step 4: Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. In Supabase Dashboard > **Authentication** > **Providers**:
   - Enable Google provider
   - Add your Google Client ID and Secret

#### Step 5: Restart Server
```bash
npm run dev
```

### Option 2: Use Email Authentication Only (Quick Fix)

If you want to skip Google authentication for now:

1. **Use existing email login**: The email/password form on the main page works
2. **Register new users**: Click "Register New User" link
3. **Admin access**: Use the admin login at `/admin/login`

The application is fully functional with email authentication - Google OAuth is just an additional convenience feature.

## Current Status

✅ **Working Features:**
- Email/password authentication
- User registration
- Admin dashboard
- Event management
- All core functionality

⚠️ **Requires Setup:**
- Google OAuth authentication
- Supabase database integration

## Quick Test

To test email authentication right now:
1. Go to the main page
2. Click "Register New User"
3. Fill out the registration form
4. Use those credentials to log in

## Need More Help?

Refer to detailed guides:
- `SUPABASE_INTEGRATION.md` - Complete Supabase setup
- `GOOGLE_OAUTH_SETUP.md` - Detailed Google OAuth configuration
- `SETUP_GOOGLE_AUTH.md` - Quick setup guide

## Existing Configuration Found

I found a Supabase URL already configured: `https://dmiofitmelntaiyrdoac.supabase.co`

If this is your project, you just need to:
1. Get the API keys from this Supabase project
2. Update the `.env.local` file with real keys
3. Enable the connection

If this is not your project, create a new Supabase project and follow Option 1 above.