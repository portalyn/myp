/*
  # Fix arrival date field name

  1. Changes
    - Add arrival_date field to match the application's expectations
    - Keep existing date field for backward compatibility
*/

-- Add arrival_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vessels' 
        AND column_name = 'arrival_date'
    ) THEN
        ALTER TABLE vessels ADD COLUMN arrival_date date DEFAULT NULL;
    END IF;
END $$;

-- Update the check constraint to include arrival_date
ALTER TABLE vessels DROP CONSTRAINT IF EXISTS vessels_date_entered_by_check;
ALTER TABLE vessels ADD CONSTRAINT vessels_arrival_date_entered_by_check
    CHECK (
        (arrival_date IS NULL AND entered_by IS NULL) OR
        (arrival_date IS NOT NULL AND entered_by IS NOT NULL)
    );