/*
  # Add date column to vessels table

  1. Changes
    - Add `date` column to vessels table (nullable)
    - Add `entered_by` column to vessels table (nullable)

  2. Notes
    - Both columns are nullable to maintain compatibility with existing records
    - `date` is used to track vessel arrival date
    - `entered_by` tracks who recorded the arrival
*/

DO $$ 
BEGIN
    -- Add date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vessels' 
        AND column_name = 'date'
    ) THEN
        ALTER TABLE vessels ADD COLUMN date date;
    END IF;

    -- Add entered_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vessels' 
        AND column_name = 'entered_by'
    ) THEN
        ALTER TABLE vessels ADD COLUMN entered_by text;
    END IF;
END $$;