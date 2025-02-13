import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    },
    storageKey: 'yanbu-marine-auth',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (!error) return 'حدث خطأ غير متوقع';
  
  // Handle authentication errors
  if (error.code === 'invalid_credentials' || 
      error.message?.includes('Invalid login credentials') ||
      error.message?.includes('invalid_credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  }
  
  // Handle network errors
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('NetworkError') ||
      error.message?.includes('network')) {
    return 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
  }
  
  // Handle session errors
  if (error.message?.includes('JWT') || 
      error.code === 'refresh_token_not_found' ||
      error.message?.includes('session')) {
    supabase.auth.signOut().catch(() => {}); // Clear any invalid session data
    return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
  }
  
  // Handle rate limiting
  if (error.status === 429 || error.message?.includes('rate limit')) {
    return 'تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار لمدة 5 دقائق قبل المحاولة مرة أخرى.';
  }
  
  return error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.';
};