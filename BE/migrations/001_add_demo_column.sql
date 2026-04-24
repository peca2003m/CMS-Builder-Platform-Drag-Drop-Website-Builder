-- Migration 001: Add demo_column to users table
-- Type: ADD COLUMN (CREATE)

ALTER TABLE users
    ADD COLUMN demo_column VARCHAR(255);

COMMENT ON COLUMN users.demo_column IS 'Demo column for migration testing';