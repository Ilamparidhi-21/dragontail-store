# DRAGONTAIL Phase 4 — PostgreSQL Catalog + Admin

This is an overlay for the existing Phase 3 site, **not a new project**. The first deployment should be done only after your HTTPS domain and PostgreSQL credentials are ready. **Do not attempt admin sign-in over the current HTTP public IP**; the authentication endpoint refuses HTTP.

## Database setup
Create a separate PostgreSQL database and least-privilege application account, ideally on private RDS or private subnet. Do not expose port 5432 to the public internet. Run `psql "$DATABASE_URL" -f schema.sql` from a network location allowed to connect. The application account needs SELECT/INSERT/UPDATE on `dt_products` plus USAGE/SELECT on its identity sequence. Initialize the database before publishing new catalog entries; otherwise the storefront displays its original demo catalog.

## Configure environment
Create `.env.production.local` on EC2 (permissions `chmod 600`), never commit it. Supply `DATABASE_URL=postgresql://...` with password URL-encoded and `ADMIN_SESSION_SECRET` (64-character random hex). Generate `ADMIN_PASSWORD_SCRYPT` using the following Node one-liner, which prompts securely for the password:

```bash
node - <<'JS'
const crypto=require('node:crypto');const fs=require('node:fs');const readline=require('node:readline');const rl=readline.createInterface({input:process.stdin,output:process.stdout});rl.question('Admin password (visible; use only on trusted terminal): ',password=>{const salt=crypto.randomBytes(16).toString('hex'); console.log(`ADMIN_PASSWORD_SCRYPT=${salt}:${crypto.scryptSync(password,salt,64).toString('hex')}`);rl.close()});
JS
```

Do not expose credentials in screenshots. Set `ADMIN_SESSION_SECRET=$(openssl rand -hex 32)` into the local env file. The app requires HTTPS requests to the admin login endpoint; use Nginx TLS and the proxy `X-Forwarded-Proto` header. Protect `/admin` with additional Nginx rate limiting or private access where practical. Before production launch add persistent rate limiting to admin login; this version is a starter admin, not a fully hardened production identity system.

## Deploy (after backing up)

```bash
cd ~/dragontail
cp -a src ~/dragontail-src-phase3-backup
unzip -o ~/DRAGONTAIL-phase4.zip
npm install
npm run build
# Only if build succeeds:
pm2 restart dragontail --update-env
pm2 save
```

For database seeding, add products through `/admin` after HTTPS setup. The seeded demo products remain available as fallback only if the database is unavailable, but are not automatically copied into the database. Publishing new products when the database is empty will immediately change what the storefront displays. Prices in this starter implementation are in whole INR. Inventory tracking, image upload, order processing, payment processing, and separate staff roles are **not yet implemented**. The cart remains browser-local, not a trusted checkout.
