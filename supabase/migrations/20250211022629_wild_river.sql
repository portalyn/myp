/*
  # Create Vessels Table (Final Version)

  1. New Tables
    - `vessels`
      - `id` (uuid, primary key)
      - `vessel_name` (text)
      - `flag` (text)
      - `coming_from` (text)
      - `heading_to` (text)
      - `crew_count` (integer)
      - `appointment` (timestamptz)
      - `agent` (text)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Policies for read, insert, and update operations
    - Automatic updated_at timestamp handling
*/

-- Drop existing table and related objects if they exist
DROP TABLE IF EXISTS vessels CASCADE;

-- Create vessels table
CREATE TABLE vessels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name text NOT NULL,
  flag text NOT NULL,
  coming_from text NOT NULL,
  heading_to text NOT NULL,
  crew_count integer NOT NULL,
  appointment timestamptz NOT NULL,
  agent text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own vessels"
  ON vessels
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vessels"
  ON vessels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vessels"
  ON vessels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_vessels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_vessels_updated_at
  BEFORE UPDATE ON vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_vessels_updated_at();