# Security Policy

## Reporting a Vulnerability

I take the security of CineStack seriously. If you discover a security vulnerability, please report it privately.

**Do not** report security vulnerabilities through public GitHub issues, discussions, or pull requests.

Instead, please send an email to: **contact@cinestack.web.id**

I will acknowledge receipt within 48 hours and provide an estimated timeline for a fix.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅ Yes |
| < latest| ❌ No |

## Scope

This security policy covers:
- The CineStack web application
- API endpoints
- Authentication and authorization
- Database security (RLS policies)

## Best Practices

- Always use environment variables for sensitive data
- Row Level Security (RLS) is enforced on all database tables
- Rate limiting is applied to authentication endpoints
- CAPTCHA protection via Cloudflare Turnstile
