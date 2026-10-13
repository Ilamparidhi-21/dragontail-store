# DRAGONTAIL Phase 6 — customer accounts

Only adds customer account pages, endpoints and a PostgreSQL migration. Keeps the existing Phase 5 storefront, its header, admin endpoints and catalog unchanged.

## Install
1. Confirm your temporary sslip.io HTTPS endpoint has a valid certificate. Do not enter customer passwords over HTTP.
2. Back up the app and PostgreSQL.
3. Extract the patch from the application root.
4. Run: `sudo -u postgres psql -v ON_ERROR_STOP=1 -d dragontail_db < phase6_accounts.sql`
5. Run `npm run build` and inspect errors before restarting the app with `pm2 restart dragontail --update-env`.
6. Test `/account` registration, login, logout, and addresses over HTTPS. The profile icon from the home/profile patch should already link to `/account`.

## Safeguards and limitations
- Customer credentials are distinct from admin credentials. Passwords use scrypt with per-user random salts, never plaintext storage.
- Customer sessions use randomly generated tokens. Only SHA-256 hashes of these tokens are stored in PostgreSQL. HTTP-only Secure cookies expire after seven days.
- Same-origin HTTPS is required for state-changing endpoints on production.
- Login locks an account after five failed password attempts for 15 minutes; add IP-level rate limiting at Nginx/WAF before public launch.
- The address book stores only shipping address details; maximum 10 saved addresses. No card information is collected.
- Order history is informational only; checkout/order infrastructure is not yet implemented.
- Wishlist synchronization is not implemented; the storefront wishlist remains browser-local.
- Password reset, email verification, account deletion, privacy/data retention workflows, and abuse protection must be added before real customer onboarding.
- Complete a proper security audit and backups before production use.
