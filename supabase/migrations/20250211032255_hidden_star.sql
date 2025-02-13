/*
  # Fix vessels table schema

  1. Changes
    - Drop and recreate vessels table with correct structure
    - Add proper constraints and defaults
    - Update RLS policies

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing table and related objects
DO $$ 
BEGIN
    DROP TABLE IF EXISTS vessels CASCADE;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create vessels table with all required columns
CREATE TABLE vessels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_name text NOT NULL,
    flag text NOT NULL,
    coming_from text NOT NULL,
    heading_to text NOT NULL,
    crew_count integer NOT NULL CHECK (crew_count >= 0),
    appointment date NOT NULL,
    agent text NOT NULL,
    date date DEFAULT NULL,
    entered_by text DEFAULT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

-- Create policies for full access
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_vessels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vessels_updated_at
    BEFORE UPDATE ON vessels
    FOR EACH ROW
    EXECUTE FUNCTION update_vessels_updated_at();