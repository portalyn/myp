/*
  # Vessels Table Setup

  1. New Tables
    - `vessels`
      - `id` (uuid, primary key)
      - `vessel_name` (text)
      - `flag` (text)
      - `coming_from` (text)
      - `heading_to` (text)
      - `crew_count` (integer)
      - `passenger_count` (integer, nullable)
      - `pilgrim_count` (integer, nullable)
      - `appointment` (date)
      - `agent` (text)
      - `arrival_date` (date, nullable)
      - `entered_by` (text, nullable)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Policies for authenticated users to:
      - Read all vessels
      - Insert own vessels
      - Update any vessel
      - Delete own vessels
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
    passenger_count integer DEFAULT NULL CHECK (passenger_count IS NULL OR passenger_count >= 0),
    pilgrim_count integer DEFAULT NULL CHECK (pilgrim_count IS NULL OR pilgrim_count >= 0),
    appointment date NOT NULL,
    agent text NOT NULL,
    arrival_date date DEFAULT NULL,
    entered_by text DEFAULT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT vessels_arrival_date_entered_by_check CHECK (
        (arrival_date IS NULL AND entered_by IS NULL) OR
        (arrival_date IS NOT NULL AND entered_by IS NOT NULL)
    )
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