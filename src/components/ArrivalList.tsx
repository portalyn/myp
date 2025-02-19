import React, { useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Ship, Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vessel {
  id: string;
  vessel_name: string;
  flag: string;
  coming_from: string;
  heading_to: string;
  crew_count: number;
  agent: string;
  entered_by: string;
  arrival_date: string;
  appointment: string;
  passenger_count: number | null;
  pilgrim_count: number | null;
}

interface ArrivalListProps {
  selectedVesselId?: string | null; // ✅ استقبال الـ selectedVesselId من App.tsx
}

export function ArrivalList({ selectedVesselId }: ArrivalListProps) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  useEffect(() => {
    fetchVessels();
  }, []);

  useEffect(() => {
    if (selectedVesselId) {
      const vessel = vessels.find((v) => v.id === selectedVesselId);
      if (vessel) setSelectedVessel(vessel); // ✅ فتح تفاصيل الناقلة مباشرة
    }
  }, [selectedVesselId, vessels]);

  const fetchVessels = async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .not('entered_by', 'is', null)
        .order('arrival_date', { ascending: false });

      if (error) throw error;
      setVessels(data || []);
    } catch (error: any) {
      toast.error(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleCopyDetails = (vessel: Vessel) => {
    const details = `تم الفسح
الناقلة: ${vessel.vessel_name}
العلم: ${vessel.flag}
قادمة من: ${vessel.coming_from}
متجهة الى: ${vessel.heading_to}
الطاقم: ${vessel.crew_count}${vessel.passenger_count ? `\nالركاب: ${vessel.passenger_count}` : ''}${vessel.pilgrim_count ? `\nالمعتمرين: ${vessel.pilgrim_count}` : ''}
التاريخ: ${formatDate(vessel.arrival_date)}`;

    navigator.clipboard.writeText(details)
      .then(() => toast.success('تم نسخ التفاصيل'))
      .catch(() => toast.error('حدث خطأ أثناء النسخ'));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedVessel ? (
        <div className="bg-white rounded-xl shadow-lg p-6 relative max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedVessel(null)}
            className="absolute top-3 left-3 text-gray-600 hover:text-red-600"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            تفاصيل الناقلة
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "العلم", value: selectedVessel.flag },
              { label: "قادمة من", value: selectedVessel.coming_from },
              { label: "متجهة إلى", value: selectedVessel.heading_to },
              { label: "عدد الطاقم", value: selectedVessel.crew_count },
              selectedVessel.passenger_count !== null && { label: "عدد الركاب", value: selectedVessel.passenger_count },
              selectedVessel.pilgrim_count !== null && { label: "عدد المعتمرين", value: selectedVessel.pilgrim_count },
              { label: "الموعد", value: formatDate(selectedVessel.appointment), dir: "ltr" },
              { label: "الوكيل", value: selectedVessel.agent },
            ]
              .filter(Boolean)
              .map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
                  <span className="block font-bold text-sm text-[#1E3A8A]">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900" dir={item.dir}>
                    {item.value}
                  </span>
                </div>
              ))}
          </div>

          <div className="flex justify-end mt-5">
            <button
              onClick={() => handleCopyDetails(selectedVessel)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              <Copy className="w-4 h-4" />
              نسخ التفاصيل
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <Ship className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">الوصول</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="py-3 px-2 text-right font-bold">الناقلة</th>
                  <th className="py-3 px-2 text-right font-bold">تاريخ الوصول</th>
                  <th className="py-3 px-2 text-right font-bold">المدخل</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map((vessel, index) => (
                  <tr
                    key={vessel.id}
                    onClick={() => setSelectedVessel(vessel)}
                    className={`cursor-pointer transition-colors ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200`}
                  >
                    <td className="py-3 px-2 text-right font-semibold">{vessel.vessel_name}</td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-600" dir="ltr">
                      {formatDate(vessel.arrival_date)}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-600">{vessel.entered_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
