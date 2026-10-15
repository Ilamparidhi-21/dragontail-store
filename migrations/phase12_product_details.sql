BEGIN;
ALTER TABLE dt_products ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;
GRANT UPDATE ON dt_customer_addresses TO dragontail_app;
COMMIT;
