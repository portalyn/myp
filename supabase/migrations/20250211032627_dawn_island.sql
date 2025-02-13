/*
  # Fix vessels date column

  1. Changes
    - Add date column if missing
    - Add entered_by column if missing
    - Add constraint to ensure both date and entered_by are either both NULL or both have values

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns and constraints
DO $$ 
BEGIN
    -- Add date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vessels' 
        AND column_name = 'date'
    ) THEN
        ALTER TABLE vessels ADD COLUMN date date DEFAULT NULL;
    END IF;

    -- Add entered_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vessels' 
        AND column_name = 'entered_by'
    ) THEN
        ALTER TABLE vessels ADD COLUMN entered_by text DEFAULT NULL;
    END IF;

    -- Add constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'vessels_date_entered_by_check'
    ) THEN
        ALTER TABLE vessels ADD CONSTRAINT vessels_date_entered_by_check 
        CHECK ((date IS NULL AND entered_by IS NULL) OR (date IS NOT NULL AND entered_by IS NOT NULL));
    END IF;
END $$;