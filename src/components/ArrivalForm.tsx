import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Ship, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vessel {
  id: string;
  vessel_name: string;
  flag: string;
  coming_from: string;
  heading_to: string;
  crew_count: number;
  appointment: string;
  agent: string;
  entered_by: string | null;
  arrival_date: string | null;
}

interface ArrivalFormProps {
  vessel: Vessel;
  onClose: () => void;
  onSuccess: (vesselId: string) => void;
}

export function ArrivalForm({ vessel, onClose, onSuccess }: ArrivalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    crew_count: vessel.crew_count.toString(),
    entered_by: '',
    arrival_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entered_by.trim()) {
      toast.error('يرجى إدخال اسم المدخل');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('vessels')
        .update({
          crew_count: parseInt(formData.crew_count),
          entered_by: formData.entered_by.trim(),
          arrival_date: formData.arrival_date
        })
        .eq('id', vessel.id);

      if (error) throw error;

      // Format the text for clipboard
      const clipboardText = `تم الفسح
الناقلة: ${vessel.vessel_name}
العلم: ${vessel.flag}
قادمة من: ${vessel.coming_from}
متجهه الى: ${vessel.heading_to}
الطاقم: ${formData.crew_count}
التاريخ: ${formData.arrival_date}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(clipboardText);
      toast.success('تم نسخ البيانات إلى الحافظة');

      toast.success('تم تسجيل الوصول بنجاح');
      onSuccess(vessel.id);
    } catch (error: any) {
      toast.error(handleSupabaseError(error));
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto my-4">
      <div className="flex items-center justify-between mb-6">
        <Ship className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">تسجيل الوصول</h2>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">معلومات الناقلة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="block text-sm font-bold text-blue-700">اسم الناقلة</span>
            <span className="text-blue-600">{vessel.vessel_name}</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-blue-700">العلم</span>
            <span className="text-blue-600">{vessel.flag}</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-blue-700">قادمة من</span>
            <span className="text-blue-600">{vessel.coming_from}</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-blue-700">متجهة إلى</span>
            <span className="text-blue-600">{vessel.heading_to}</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-blue-700">الموعد</span>
            <span className="text-blue-600">{vessel.appointment}</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-blue-700">الوكيل</span>
            <span className="text-blue-600">{vessel.agent}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">
              المدخل
            </label>
            <input
              type="text"
              name="entered_by"
              value={formData.entered_by}
              onChange={handleChange}
              required
              className="form-input"
              dir="rtl"
              placeholder="أدخل اسم المدخل"
            />
          </div>

          <div>
            <label className="form-label">
              تاريخ الوصول
            </label>
            <input
              type="date"
              name="arrival_date"
              value={formData.arrival_date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">
              عدد الطاقم
            </label>
            <input
              type="number"
              name="crew_count"
              value={formData.crew_count}
              onChange={handleChange}
              required
              min="0"
              className="form-input"
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>جاري الحفظ...</>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ البيانات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}