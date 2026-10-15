BEGIN;
ALTER TABLE dt_products ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_dt_products_not_deleted ON dt_products (id) WHERE deleted_at IS NULL;
COMMIT;
