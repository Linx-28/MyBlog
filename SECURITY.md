# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within MyBlog, please send an email to 13477477834@163.com. All security vulnerabilities will be promptly addressed.

**Please do NOT report security vulnerabilities through public GitHub issues.**

## Disclosure Policy

When the security team receives a security bug report, they will assign it to a primary handler. This person will coordinate the fix and release process, involving the following steps:

1. Confirm the problem and determine the affected versions.
2. Audit code to find any potential similar problems.
3. Prepare fixes for all releases still under maintenance.
4. Release patched versions.

## Security Related Configuration

- Admin authentication is handled via token-based authentication
- Default admin password should be changed in production
- CORS is configured to restrict cross-origin requests

## Best Practices

When deploying this application:

1. Change the default admin password
2. Use HTTPS in production
3. Keep dependencies updated
4. Restrict network access to the database
