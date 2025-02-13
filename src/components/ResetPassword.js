import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// إعداد Supabase باستخدام المفاتيح من .env
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // استخراج التوكن من الرابط

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!token) {
            setMessage("رمز التحقق غير موجود!");
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("تم تحديث كلمة المرور بنجاح! سيتم تحويلك لصفحة تسجيل الدخول...");
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>إعادة تعيين كلمة المرور</h2>
            <form onSubmit={handleResetPassword}>
                <input
                    type="password"
                    placeholder="أدخل كلمة المرور الجديدة"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px', marginBottom: '10px' }}
                />
                <br />
                <button type="submit" style={{ padding: '10px 20px' }}>تحديث كلمة المرور</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;
