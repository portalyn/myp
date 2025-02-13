/*
  # Create vessels table

  1. New Tables
    - `vessels`
      - `id` (uuid, primary key)
      - `vessel_name` (text) - اسم الناقلة
      - `flag` (text) - العلم
      - `coming_from` (text) - قادمة من
      - `heading_to` (text) - متجهة إلى
      - `crew_count` (integer) - عدد الطقم
      - `appointment` (timestamptz) - الموعد
      - `agent` (text) - الوكيل
      - `date` (date) - التاريخ
      - `entered_by` (text) - المدخل
      - `user_id` (uuid, foreign key) - معرف المستخدم
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS vessels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name text NOT NULL,
  flag text NOT NULL,
  coming_from text NOT NULL,
  heading_to text NOT NULL,
  crew_count integer NOT NULL,
  appointment timestamptz NOT NULL,
  agent text NOT NULL,
  date date NOT NULL,
  entered_by text NOT NULL,
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