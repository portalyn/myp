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
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-5 w-full max-w-3xl mx-auto my-3 font-[Tajawal]">
  {/* 🔹 العنوان */}
  <div className="flex items-center justify-between mb-3 border-b pb-2">
    <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-1">
      <span>🔍 معلومات الناقلة</span>
    </h2>
  </div>

  {/* 🔹 معلومات الناقلة */}
  <div className="mb-3 bg-gray-50 p-2 rounded-lg shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
      {[
        { label: "اسم الناقلة", value: vessel.vessel_name },
        { label: "العلم", value: vessel.flag },
        { label: "قادمة من", value: vessel.coming_from },
        { label: "متجهة إلى", value: vessel.heading_to },
        { label: "الموعد", value: vessel.appointment },
        { label: "الوكيل", value: vessel.agent }
      ].map((item, index) => (
        <div key={index} className="p-2 rounded-md border bg-white shadow-sm">
          <span className="block font-bold text-[#1E3A8A] text-[15px]">{item.label}</span>
          <span className="text-[15px] font-semibold text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  </div>

  {/* 🔹 نموذج الإدخال */}
  <form onSubmit={handleSubmit} className="space-y-2">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {[
        { name: "entered_by", label: "المدخل", type: "text", placeholder: "أدخل اسم المدخل", dir: "rtl" },
        { name: "arrival_date", label: "تاريخ الوصول", type: "date", placeholder: "" },
        { name: "crew_count", label: "عدد الطاقم", type: "number", placeholder: "", min: 0, dir: "rtl" }
      ].map((field, index) => (
        <div key={index}>
          <label className="block font-bold text-[#1E3A8A] text-[15px] mb-[2px]">{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            required
            min={field.min}
            dir={field.dir}
            placeholder={field.placeholder}
            className="w-full px-2 py-[6px] rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-[15px] shadow-sm transition"
          />
        </div>
      ))}
    </div>

    {/* 🔹 الأزرار */}
    <div className="flex justify-end gap-2 mt-3">
      <button
        type="button"
        onClick={onClose}
        className="px-3 py-[7px] rounded-md text-gray-700 border border-gray-300 text-[15px] hover:bg-gray-100 transition"
      >
        إلغاء
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-[7px] rounded-md text-[15px] hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition disabled:opacity-50"
      >
        {isLoading ? "جاري الحفظ..." : <>💾 حفظ البيانات</>}
      </button>
    </div>
  </form>
</div>

    

    );
  }
  