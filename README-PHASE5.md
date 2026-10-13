# DRAGONTAIL Phase 5 — variant inventory

This patch targets the Phase 4 code plus Phase 3 storefront. **Back up files and database first.**

1. Copy archive to ~/; from ~/dragontail run `unzip -o ~/DRAGONTAIL-phase5-inventory.zip`.
2. Apply migration with `sudo -u postgres psql -v ON_ERROR_STOP=1 -d dragontail_db < phase5_inventory.sql` (the shell must be able to read the SQL file).
3. Run `npm install && npm run build` and only restart PM2 on success: `pm2 restart dragontail --update-env`.
4. Visit the HTTPS /admin page, choose **Stock** next to a product, and enter quantities for each color/size.
5. Verify public GET /api/products contains inventory and test out-of-stock / in-stock Add to Bag behavior.

**Security & behavior:** No public stock mutations. Authenticated admin edits validate quantities and variant combinations in a transaction. The public availability endpoint checks current stock in PostgreSQL. A browser cart is not a reservation; no inventory is deducted. Actual purchase and stock decrement require a server-side checkout transaction and payment verification in the next phase. Never claim that cart stock checks prevent overselling during future checkout. New inventory rows start at 0. If you change colors/sizes in the product editor, corresponding stock rows are created when you next save in the Stock editor. Old option rows are removed at that point.

**Database:** New dt_inventory table, no destructive product-table alterations. Migration is repeatable. The application database user requires SELECT, INSERT, UPDATE and DELETE on dt_inventory.

**Production deployment caution:** Next.js 15 live rebuilds can invalidate JavaScript assets served by a currently-running process. Prefer building to a separate release directory and performing an atomic switch. For simple one-instance dev deployment, expect a brief maintenance window; take backups before extracting and keep the previous release for rollback.
