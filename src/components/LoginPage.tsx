import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { LogIn, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '@supabase/supabase-js';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [attempts, setAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<Date | null>(null);

  // Reset attempts after 5 minutes
  useEffect(() => {
    if (attempts > 0 && lastAttemptTime) {
      const timer = setTimeout(() => {
        setAttempts(0);
        setLastAttemptTime(null);
      }, 5 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [attempts, lastAttemptTime]);

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    if (!formData.password) {
      toast.error('يرجى إدخال كلمة المرور');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    return true;
  };

  const getRemainingTime = () => {
    if (!lastAttemptTime) return 0;
    const elapsed = new Date().getTime() - lastAttemptTime.getTime();
    const remaining = Math.max(0, 5 * 60 * 1000 - elapsed);
    return Math.ceil(remaining / 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check attempts
    if (attempts >= 5) {
      const remainingSeconds = getRemainingTime();
      if (remainingSeconds > 0) {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        toast.error(`يرجى الانتظار ${minutes} دقيقة و ${seconds} ثانية قبل المحاولة مرة أخرى`);
        return;
      }
    }

    // Validate form
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (error) throw error;

      if (!session?.user) {
        throw new Error('حدث خطأ أثناء تسجيل الدخول');
      }

      // Reset attempts on successful login
      setAttempts(0);
      setLastAttemptTime(null);
      toast.success('✅ تم تسجيل الدخول بنجاح');
      onLoginSuccess(session.user);
    } catch (error: any) {
      console.error('Login error:', error);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setLastAttemptTime(new Date());
      
      // Show remaining attempts warning
      if (newAttempts < 5) {
        toast.error(`${handleSupabaseError(error)}\nمحاولات متبقية: ${5 - newAttempts}`);
      } else {
        toast.error('تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة بعد 5 دقائق.');
      }
      
      // Clear password on error
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isLocked = attempts >= 5 && getRemainingTime() > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-600">مرحباً بك في نظام إدارة الناقلات البحرية</p>
        </div>

        {isLocked && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">
              تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة بعد {Math.floor(getRemainingTime() / 60)} دقيقة و {getRemainingTime() % 60} ثانية.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              dir="ltr"
              autoComplete="email"
              placeholder="example@domain.com"
              disabled={isLocked}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              dir="ltr"
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLocked}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          {attempts > 0 && !isLocked && (
            <p className="text-sm text-red-600 text-center">
              {`محاولات متبقية: ${5 - attempts}`}
            </p>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              مستخدم جديد؟
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => window.location.href = 'mailto:admin@yanbu.port?subject=طلب حساب جديد&body=السلام عليكم،%0D%0A%0D%0Aأرغب في الحصول على حساب جديد في نظام إدارة الناقلات البحرية.%0D%0A%0D%0Aالاسم:%0D%0Aالوظيفة:%0D%0Aرقم الجوال:'}
                className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                disabled={isLocked}
              >
                <UserPlus className="w-5 h-5" />
                طلب حساب جديد
              </button>
              <button
                onClick={() => window.location.href = 'mailto:admin@yanbu.port?subject=نسيت كلمة المرور&body=السلام عليكم،%0D%0A%0D%0Aأرجو إعادة تعيين كلمة المرور لحسابي.%0D%0A%0D%0Aالبريد الإلكتروني:'}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
                disabled={isLocked}
              >
                <ArrowRight className="w-4 h-4" />
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}