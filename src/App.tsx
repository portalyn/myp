import React, { useState, useEffect } from 'react';
import { Loader2, Lock, Mail, User, LogOut, Search, BarChart2, Calendar, Import as FileImport, Home } from 'lucide-react';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { VesselForm } from './components/VesselForm';
import { WaitingList } from './components/WaitingList';
import { ArrivalList } from './components/ArrivalList';
import { Statistics } from './components/Statistics';
import { Schedule } from './components/Schedule';
import { MarineMap } from './components/MarineMap';
import { ImportPage } from './components/ImportPage';

type View = 'home' | 'form' | 'waiting' | 'arrived' | 'search' | 'stats' | 'schedule' | 'import';

interface SearchVessel {
  id: string;
  vessel_name: string;
  flag: string;
  coming_from: string;
  heading_to: string;
  crew_count: number;
  passenger_count: number | null;
  pilgrim_count: number | null;
  appointment: string;
  agent: string;
  arrival_date: string | null;
}

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeView, setActiveView] = useState<View>('home');
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);

  // ✅ تحديث العنوان تلقائيًا عند تغيير الصفحة
  useEffect(() => {
    document.title = 'نظام إدارة الناقلات البحرية';
  }, []);

  // ✅ تحديث حالة المستخدم عند تغيير الجلسة
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      toast.success(isSignUp ? 'تم إنشاء الحساب بنجاح!' : 'تم تسجيل الدخول بنجاح!');
      
      if (isSignUp) setIsSignUp(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('تم تسجيل الخروج بنجاح');
    setActiveView('home');
  };

  const renderHomeButtons = () => (
    <div className="max-w-xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">برنامج مركز المراقبة</h1>
        <p className="text-gray-600">نظام إدارة فسح الناقلات البحرية</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <button onClick={() => setActiveView('search')} className="btn-nav">
          <Search className="icon-nav" /> <span>بحث</span>
        </button>
        <button onClick={() => setActiveView('stats')} className="btn-nav">
          <BarChart2 className="icon-nav" /> <span>إحصائيات</span>
        </button>
        <button onClick={() => setActiveView('schedule')} className="btn-nav">
          <Calendar className="icon-nav" /> <span>جدول العمل</span>
        </button>
        <button onClick={() => setActiveView('import')} className="btn-nav">
          <FileImport className="icon-nav" /> <span>استيراد</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f3f3]" dir="rtl">
      {user ? (
        <div className="max-w-6xl mx-auto px-4">
          <nav className="bg-blue-600 shadow-md mb-6 p-2 flex justify-end gap-2 rounded-lg">
            <button onClick={() => setActiveView('home')} className="btn-nav">
              <Home className="icon-nav" /> الرئيسية
            </button>
            <button onClick={() => setActiveView('form')} className="btn-nav">إضافة</button>
            <button onClick={() => setActiveView('waiting')} className="btn-nav">الانتظار</button>
            <button onClick={() => setActiveView('arrived')} className="btn-nav">الوصول</button>
            <button onClick={handleSignOut} className="btn-nav">
              <LogOut className="icon-nav" /> تسجيل الخروج
            </button>
          </nav>

          <div className="pb-6">
            {activeView === 'home' && renderHomeButtons()}
            {activeView === 'form' && <VesselForm onSuccess={() => setActiveView('waiting')} />}
            {activeView === 'waiting' && <WaitingList onArrivalSuccess={(vesselId) => setSelectedVesselId(vesselId)} />}
            {activeView === 'arrived' && <ArrivalList selectedVesselId={selectedVesselId} />}
            {activeView === 'search' && <MarineMap />}
            {activeView === 'stats' && <Statistics />}
            {activeView === 'schedule' && <Schedule />}
            {activeView === 'import' && <ImportPage />}
          </div>
        </div>
      ) : (
        <div className="auth-container">
          <Lock className="icon-lock" />
          <h1>{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h1>
          <form onSubmit={handleAuth} className="auth-form">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" required />
            <button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="icon-spin" /> : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</button>
          </form>
        </div>
      )}
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
