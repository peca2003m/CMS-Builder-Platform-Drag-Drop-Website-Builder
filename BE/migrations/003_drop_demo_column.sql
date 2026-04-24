-- Migration 003: Remove demo_column from users table
-- Type: DROP COLUMN (DELETE)

ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_demo_column_length;

ALTER TABLE users
DROP COLUMN IF EXISTS demo_column;