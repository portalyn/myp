/*
  # Enhanced Security Policies for Vessels

  1. Security Updates
    - Add policies for vessel management
    - Enable editing for authenticated users
    - Allow reading all vessels for authenticated users
    - Restrict updates to vessel owners and admins
    - Enable inserting for authenticated users

  2. Policies
    - Read: All authenticated users can read vessels
    - Insert: Authenticated users can add new vessels
    - Update: Users can update their own vessels
    - Delete: Only vessel owners can delete their records
*/

-- حذف السياسات القديمة إذا كانت موجودة
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can insert vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can update own vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can delete own vessels" ON vessels;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- سياسة القراءة: يمكن لجميع المستخدمين المصادق عليهم قراءة السجلات
CREATE POLICY "Users can read vessels"
    ON vessels FOR SELECT
    TO authenticated
    USING (true);

-- سياسة الإضافة: يمكن للمستخدمين المصادق عليهم إضافة سجلات جديدة
CREATE POLICY "Users can insert vessels"
    ON vessels FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- سياسة التحديث: يمكن للمستخدمين تحديث سجلاتهم الخاصة
CREATE POLICY "Users can update own vessels"
    ON vessels FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- سياسة الحذف: يمكن للمستخدمين حذف سجلاتهم الخاصة
CREATE POLICY "Users can delete own vessels"
    ON vessels FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);