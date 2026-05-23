-- ============================================================
-- Migration: New Checkout Flow
-- Jaya Mandiri Percetakan & Advertising
-- ============================================================

-- 1. Add new ENUM values to status_order (safe - uses DO block to skip if exists)
DO $$
BEGIN
  -- Add new status values only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_design' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_order')) THEN
    ALTER TYPE status_order ADD VALUE 'pending_design';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'design_uploaded' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_order')) THEN
    ALTER TYPE status_order ADD VALUE 'design_uploaded';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_rejected' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_order')) THEN
    ALTER TYPE status_order ADD VALUE 'payment_rejected';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'revision_requested' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_order')) THEN
    ALTER TYPE status_order ADD VALUE 'revision_requested';
  END IF;
END;
$$;

-- 2. Add new columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS revision_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_notes TEXT,
  ADD COLUMN IF NOT EXISTS payment_rejected_reason TEXT;

-- 3. Migrate existing data: map old statuses to new flow
UPDATE orders SET status = 'pending_design'      WHERE status = 'waiting_payment';
UPDATE orders SET status = 'design_review'        WHERE status = 'paid';

-- 4. Grant needed permissions to printing_user for new columns
GRANT SELECT, INSERT, UPDATE ON orders TO printing_user;

-- 5. Ensure design_files table exists
CREATE TABLE IF NOT EXISTS design_files (
  id             SERIAL PRIMARY KEY,
  order_item_id  INT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  file_path      TEXT NOT NULL,
  version        INT NOT NULL DEFAULT 1,
  uploaded_by    INT NOT NULL REFERENCES users(id),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON design_files TO printing_user;
GRANT USAGE, SELECT ON SEQUENCE design_files_id_seq TO printing_user;

-- 6. Ensure design_reviews table exists
CREATE TABLE IF NOT EXISTS design_reviews (
  id              SERIAL PRIMARY KEY,
  design_file_id  INT NOT NULL REFERENCES design_files(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes           TEXT,
  reviewed_by     INT REFERENCES users(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON design_reviews TO printing_user;
GRANT USAGE, SELECT ON SEQUENCE design_reviews_id_seq TO printing_user;

-- 7. Ensure order_status_logs table exists
CREATE TABLE IF NOT EXISTS order_status_logs (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      VARCHAR(50) NOT NULL,
  changed_by  INT NOT NULL REFERENCES users(id),
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT ON order_status_logs TO printing_user;
GRANT USAGE, SELECT ON SEQUENCE order_status_logs_id_seq TO printing_user;

-- 8. Performance indexes
CREATE INDEX IF NOT EXISTS idx_design_files_order_item ON design_files(order_item_id);
CREATE INDEX IF NOT EXISTS idx_design_reviews_file     ON design_reviews(design_file_id);
CREATE INDEX IF NOT EXISTS idx_orders_status           ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id          ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_osl_order_id            ON order_status_logs(order_id);
