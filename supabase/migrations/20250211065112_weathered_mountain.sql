/*
  # Add arrival_date column to vessels table

  1. Changes
    - Add arrival_date column of type date
    - Remove old date column
    - Update constraints to use arrival_date instead of date
    - Add check constraint for arrival_date and entered_by

  2. Security
    - No changes to RLS policies
*/

-- Drop old columns and constraints
DO $$ 
BEGIN
    -- Drop old columns
    ALTER TABLE vessels DROP COLUMN IF EXISTS date;
    
    -- Add arrival_date column
    ALTER TABLE vessels ADD COLUMN arrival_date date DEFAULT NULL;
END $$;

-- Add constraint to ensure arrival_date and entered_by are set together
ALTER TABLE vessels DROP CONSTRAINT IF EXISTS vessels_arrival_check;
ALTER TABLE vessels ADD CONSTRAINT vessels_arrival_date_entered_by_check
    CHECK (
        (arrival_date IS NULL AND entered_by IS NULL) OR
        (arrival_date IS NOT NULL AND entered_by IS NOT NULL)
    );