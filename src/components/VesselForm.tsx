import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Ship, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface VesselFormProps {
  onSuccess: () => void;
}

export function VesselForm({ onSuccess }: VesselFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    vesselName: '',
    flag: '',
    comingFrom: '',
    headingTo: '',
    crewCount: '',
    passengerCount: '',
    pilgrimCount: '',
    appointment: '',
    agent: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from('vessels').insert({
        vessel_name: formData.vesselName,
        flag: formData.flag,
        coming_from: formData.comingFrom,
        heading_to: formData.headingTo,
        crew_count: parseInt(formData.crewCount),
        passenger_count: formData.passengerCount ? parseInt(formData.passengerCount) : null,
        pilgrim_count: formData.pilgrimCount ? parseInt(formData.pilgrimCount) : null,
        appointment: formData.appointment,
        agent: formData.agent,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast.success('تم حفظ بيانات الناقلة بنجاح');
setTimeout(() => {
  onSuccess(); // الانتقال بعد تأخير قصير
}, 300); // تأخير لمدة 300 مللي ثانية

      setFormData({
        vesselName: '',
        flag: '',
        comingFrom: '',
        headingTo: '',
        crewCount: '',
        passengerCount: '',
        pilgrimCount: '',
        appointment: '',
        agent: ''
      });
      onSuccess();
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <Ship className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">إضافة ناقلة</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              اسم الناقلة
            </label>
            <input
              type="text"
              name="vesselName"
              value={formData.vesselName}
              onChange={handleChange}
              required
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="أدخل اسم الناقلة"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              العلم
            </label>
            <input
              type="text"
              name="flag"
              value={formData.flag}
              onChange={handleChange}
              required
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="أدخل العلم"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              قادمة من
            </label>
            <input
              type="text"
              name="comingFrom"
              value={formData.comingFrom}
              onChange={handleChange}
              required
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="أدخل نقطة القدوم"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              متجهة إلى
            </label>
            <input
              type="text"
              name="headingTo"
              value={formData.headingTo}
              onChange={handleChange}
              required
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="أدخل الوجهة"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              عدد الطاقم
            </label>
            <input
              type="number"
              name="crewCount"
              value={formData.crewCount}
              onChange={handleChange}
              required
              min="0"
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="أدخل عدد الطاقم"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              عدد الركاب
            </label>
            <input
              type="number"
              name="passengerCount"
              value={formData.passengerCount}
              onChange={handleChange}
              min="0"
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="اختياري"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              عدد المعتمرين
            </label>
            <input
              type="number"
              name="pilgrimCount"
              value={formData.pilgrimCount}
              onChange={handleChange}
              min="0"
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="اختياري"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              الموعد
            </label>
            <input
              type="date"
              name="appointment"
              value={formData.appointment}
              onChange={handleChange}
              required
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="border border-blue-100 rounded-lg p-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">
              الوكيل
            </label>
            <input
              type="text"
              name="agent"
              value={formData.agent}
              onChange={handleChange}
              required
              className="form-input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              dir="rtl"
              placeholder="أدخل اسم الوكيل"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
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