BEGIN;
CREATE TABLE IF NOT EXISTS dt_sizing_backup_v13 (product_id INTEGER PRIMARY KEY,saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),sizes TEXT[] NOT NULL,details JSONB NOT NULL,inventory JSONB NOT NULL);
INSERT INTO dt_sizing_backup_v13(product_id,sizes,details,inventory)
SELECT p.id,p.sizes,p.details,COALESCE((SELECT jsonb_agg(to_jsonb(i)) FROM dt_inventory i WHERE i.product_id=p.id),'[]'::jsonb) FROM dt_products p WHERE p.deleted_at IS NULL ON CONFLICT(product_id) DO NOTHING;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM dt_products WHERE deleted_at IS NULL AND category<>'Accessories' AND NOT sizes <@ ARRAY['XS','S','M','L','XL']::text[]) THEN RAISE EXCEPTION 'Non-standard clothing sizes found. Review before migration; nothing has changed.'; END IF;
END $$;
UPDATE dt_products SET sizes=ARRAY['XS','S','M','L','XL']::text[] WHERE deleted_at IS NULL AND category<>'Accessories';
CREATE TEMP TABLE dt_unsized_accessories ON COMMIT DROP AS SELECT id FROM dt_products WHERE deleted_at IS NULL AND category='Accessories' AND NOT (details ? 'accessorySized');
CREATE TEMP TABLE dt_accessory_totals ON COMMIT DROP AS SELECT i.product_id,i.color,SUM(i.quantity)::int AS quantity FROM dt_inventory i JOIN dt_unsized_accessories a ON a.id=i.product_id GROUP BY i.product_id,i.color;
DELETE FROM dt_inventory WHERE product_id IN (SELECT id FROM dt_unsized_accessories);
INSERT INTO dt_inventory(product_id,color,size,quantity,updated_at) SELECT product_id,color,'ONE SIZE',quantity,NOW() FROM dt_accessory_totals;
UPDATE dt_products SET sizes=ARRAY['ONE SIZE']::text[],details=details||'{"accessorySized":false}'::jsonb WHERE id IN (SELECT id FROM dt_unsized_accessories);
COMMIT;
