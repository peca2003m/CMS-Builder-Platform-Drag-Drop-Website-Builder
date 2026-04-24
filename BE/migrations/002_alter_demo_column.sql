-- Migration 002: Modify demo_column in users table
-- Type: ALTER COLUMN (MODIFY)

ALTER TABLE users
ALTER COLUMN demo_column TYPE TEXT;

ALTER TABLE users
    ALTER COLUMN demo_column SET DEFAULT 'default_value';

ALTER TABLE users
    ADD CONSTRAINT check_demo_column_length CHECK (LENGTH(demo_column) <= 500);

COMMENT ON COLUMN users.demo_column IS 'Modified demo column with TEXT type and constraints';