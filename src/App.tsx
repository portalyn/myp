import React, { useState, useEffect } from 'react';
import { Loader2, Lock, Mail, User, LogOut, Search, BarChart2, Calendar, Import as FileImport, Home, Ship } from 'lucide-react';
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

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeView, setActiveView] = useState<View>('home');
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchVessel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imoNumber, setImoNumber] = useState('');

  useEffect(() => {
    // ✅ تحديث العنوان عند تحميل الصفحة
    document.title = "نظام إدارة الناقلات البحرية";

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = () => {
    if (!imoNumber.trim()) {
      toast.error('الرجاء إدخال رقم IMO');
      return;
    }

    if (!/^\d{7}$/.test(imoNumber)) {
      toast.error('رقم IMO يجب أن يتكون من 7 أرقام');
      return;
    }

    toast.success('جاري البحث عن السفينة...');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          }
          throw error;
        }
        toast.success('تم تسجيل الدخول بنجاح!');
      }
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
        <button
          onClick={() => setActiveView('search')}
          className="flex flex-col items-center justify-center bg-white p-2.5 rounded-lg shadow hover:bg-blue-50 transition-colors group"
        >
          <Search className="w-6 h-6 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-gray-900">بحث</span>
        </button>
        <button
          onClick={() => setActiveView('stats')}
          className="flex flex-col items-center justify-center bg-white p-2.5 rounded-lg shadow hover:bg-blue-50 transition-colors group"
        >
          <BarChart2 className="w-6 h-6 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-gray-900">إحصائيات</span>
        </button>
        <button
          onClick={() => setActiveView('schedule')}
          className="flex flex-col items-center justify-center bg-white p-2.5 rounded-lg shadow hover:bg-blue-50 transition-colors group"
        >
          <Calendar className="w-6 h-6 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-gray-900">جدول العمل</span>
        </button>
        <button
          onClick={() => setActiveView('import')}
          className="flex flex-col items-center justify-center bg-white p-2.5 rounded-lg shadow hover:bg-blue-50 transition-colors group"
        >
          <FileImport className="w-6 h-6 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-gray-900">استيراد</span>
        </button>
      </div>
    </div>
  );

  if (user) {
    return (
      <div className="min-h-screen bg-[#f3f3f3]" dir="rtl">
        <div className={`${activeView === 'search' ? 'px-0' : 'max-w-6xl mx-auto px-2 sm:px-4 md:px-6'}`}>
          <nav className={`bg-blue-600 shadow-md mb-6 overflow-x-auto ${activeView === 'search' ? 'rounded-none' : 'rounded-lg'}`}>
            <div className="flex items-center justify-end p-2 gap-1 sm:gap-2 min-w-max">
              {activeView !== 'home' && (
                <button
                  onClick={() => setActiveView('home')}
                  className="p-2 rounded-lg text-white hover:bg-blue-500 transition"
                  title="الرئيسية"
                >
                  <Home className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setActiveView('form')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap ${
                  activeView === 'form'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
              >
                إضافة
              </button>
              <button
                onClick={() => setActiveView('waiting')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap ${
                  activeView === 'waiting'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
              >
                الانتظار
              </button>
              <button
                onClick={() => setActiveView('arrived')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap ${
                  activeView === 'arrived'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
              >
                الوصول
              </button>
              <div className="h-6 w-px bg-blue-400 mx-1 sm:mx-2"></div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-white hover:bg-blue-500 transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>
          
          <div className={activeView === 'search' ? '' : 'pb-6'}>
            {activeView === 'home' && renderHomeButtons()}
            {activeView === 'form' && (
              <VesselForm onSuccess={() => setActiveView('waiting')} />
            )}
            {activeView === 'waiting' && (
              <WaitingList 
                onArrivalSuccess={(vesselId) => {
                  setActiveView('arrived');
                  setSelectedVesselId(vesselId);
                }}
              />
            )}
            {activeView === 'arrived' && (
              <ArrivalList selectedVesselId={selectedVesselId} />
            )}
            {activeView === 'search' && (
              <div className="h-[calc(100vh-56px)]">
                <MarineMap />
              </div>
            )}
            {activeView === 'stats' && <Statistics />}
            {activeView === 'schedule' && (
              <div className="space-y-6">
                <Schedule />
              </div>
            )}
            {activeView === 'import' && <ImportPage />}
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h1>
          <p className="text-gray-600">مرحباً بك في موقعنا</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="example@domain.com"
                required
                dir="ltr"
              />
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="******"
                required
                dir="ltr"
                minLength={6}
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {isSignUp && (
              <p className="mt-2 text-sm text-gray-500">
                يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 mx-auto" />
            ) : isSignUp ? (
              'إنشاء حساب'
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isSignUp
              ? 'لديك حساب بالفعل؟ سجل دخولك'
              : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
          </button>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
