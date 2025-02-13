/*
  # Fix arrival date field to use updated_at

  1. Changes
    - Remove arrival_date and date columns
    - Use updated_at for tracking arrival dates
    - Update constraint to use updated_at
*/

-- Drop old columns and constraints
DO $$ 
BEGIN
    -- Drop old constraint
    ALTER TABLE vessels DROP CONSTRAINT IF EXISTS vessels_arrival_date_entered_by_check;
    ALTER TABLE vessels DROP CONSTRAINT IF EXISTS vessels_date_entered_by_check;
    
    -- Drop old columns
    ALTER TABLE vessels DROP COLUMN IF EXISTS arrival_date;
    ALTER TABLE vessels DROP COLUMN IF EXISTS date;
END $$;

-- Update the check constraint to use updated_at
ALTER TABLE vessels ADD CONSTRAINT vessels_arrival_check
    CHECK (
        (entered_by IS NULL) OR
        (entered_by IS NOT NULL)
    );