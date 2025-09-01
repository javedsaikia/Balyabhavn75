# Vercel Deployment Guide

## Environment Variables Required

Before deploying to Vercel, ensure you configure the following environment variables in your Vercel project settings:

### Required Variables

```bash
# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Connection Control
NEXT_PUBLIC_SUPABASE_CONNECTION_ENABLED=true

# Environment
NODE_ENV=production

# API Configuration
NEXT_PUBLIC_API_URL=https://your-vercel-domain.vercel.app/api
```

### Optional Variables

```bash
# Custom Configuration
CUSTOM_KEY=your-custom-key-if-needed
```

## Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Add all required variables in Vercel dashboard
3. **Set Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. **Deploy**: Trigger deployment

## Pre-deployment Checklist

- ✅ Build process completes without errors
- ✅ TypeScript compilation passes
- ✅ All environment variables configured
- ✅ Supabase database schema applied
- ✅ Dependencies are compatible
- ✅ Vercel configuration is valid

## Important Notes

- Ensure your Supabase database has the required tables created using `supabase-schema.sql`
- Update `NEXT_PUBLIC_API_URL` to match your Vercel deployment URL
- Change `JWT_SECRET` to a secure production value
- Set `NODE_ENV=production` for production deployment

## Troubleshooting

If you encounter API errors after deployment:
1. Verify all environment variables are set correctly
2. Check Supabase database schema is applied
3. Ensure Supabase RLS policies are configured
4. Verify API routes are accessible