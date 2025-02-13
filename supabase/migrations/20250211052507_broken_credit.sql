/*
  # Add passenger and pilgrim count fields

  1. Changes
    - Add `passenger_count` column (integer, nullable)
    - Add `pilgrim_count` column (integer, nullable)
    - Add check constraints to ensure counts are non-negative when present

  2. Notes
    - Both fields are optional
    - When values are provided, they must be zero or positive
*/

-- Add passenger_count and pilgrim_count columns
DO $$ 
BEGIN
    -- Add passenger_count if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vessels' 
        AND column_name = 'passenger_count'
    ) THEN
        ALTER TABLE vessels ADD COLUMN passenger_count integer DEFAULT NULL;
        ALTER TABLE vessels ADD CONSTRAINT vessels_passenger_count_check 
            CHECK (passenger_count IS NULL OR passenger_count >= 0);
    END IF;

    -- Add pilgrim_count if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vessels' 
        AND column_name = 'pilgrim_count'
    ) THEN
        ALTER TABLE vessels ADD COLUMN pilgrim_count integer DEFAULT NULL;
        ALTER TABLE vessels ADD CONSTRAINT vessels_pilgrim_count_check 
            CHECK (pilgrim_count IS NULL OR pilgrim_count >= 0);
    END IF;
END $$;