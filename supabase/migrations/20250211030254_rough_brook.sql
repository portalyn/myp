-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can insert vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can update vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can delete vessels" ON vessels;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Ensure the vessels table has all required columns
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

-- Create new policies that allow full access to authenticated users
CREATE POLICY "Users can read vessels"
    ON vessels FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert vessels"
    ON vessels FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update vessels"
    ON vessels FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Users can delete vessels"
    ON vessels FOR DELETE
    TO authenticated
    USING (true);