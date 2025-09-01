# Security Guidelines

## Environment Variables

### Required Environment Variables
Ensure these environment variables are set before running the application:

- `JWT_SECRET`: A secure secret key for JWT token signing (minimum 32 characters)
- `NODE_ENV`: Set to 'production' in production environments

### Optional Environment Variables
- `DATABASE_URL`: Database connection string (if using external database)
- `NEXT_PUBLIC_API_URL`: API base URL for frontend requests
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

## Security Headers

The application implements the following security headers:

- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Strict-Transport-Security**: Enforces HTTPS connections
- **Content-Security-Policy**: Controls resource loading
- **Referrer-Policy**: Controls referrer information

## Authentication

- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- Session cookies are HTTP-only and secure

## Best Practices

1. **Never commit secrets to version control**
2. **Use strong, unique JWT secrets in production**
3. **Regularly rotate JWT secrets**
4. **Enable HTTPS in production**
5. **Keep dependencies updated**
6. **Monitor for security vulnerabilities**

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production`
2. Generate a strong JWT secret (minimum 32 characters)
3. Configure proper database credentials
4. Enable HTTPS
5. Review and test all security headers
6. Perform security audit

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by contacting the development team directly.