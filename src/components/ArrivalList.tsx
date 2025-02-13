import React, { useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Ship, Copy } from 'lucide-react';
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
  selectedVesselId?: string | null;
}

export function ArrivalList({ selectedVesselId }: ArrivalListProps) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVessels();
  }, []);

  useEffect(() => {
    if (selectedVesselId) {
      setSelectedId(selectedVesselId);
    }
  }, [selectedVesselId]);

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
      console.error('Error fetching vessels:', error);
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
متجهه الى: ${vessel.heading_to}
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <Ship className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">الوصول</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-2 text-right font-medium text-gray-500">الناقلة</th>
                <th className="py-3 px-2 text-right font-medium text-gray-500">تاريخ الوصول</th>
                <th className="py-3 px-2 text-right font-medium text-gray-500">المدخل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{vessels.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  لا توجد ناقلات في قائمة الوصول
                </td>
              </tr>
            ) : (
              vessels.map((vessel) => (
                <React.Fragment key={vessel.id}>
                  <tr
                    onClick={() => setSelectedId(selectedId === vessel.id ? null : vessel.id)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedId === vessel.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-2 px-2 whitespace-nowrap">{vessel.vessel_name}</td>
                    <td className="py-2 px-2 whitespace-nowrap text-gray-500 text-xs" dir="ltr">
                      {formatDate(vessel.arrival_date)}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap text-gray-500">{vessel.entered_by}</td>
                  </tr>
                  {selectedId === vessel.id && (
                    <tr>
                      <td colSpan={3} className="px-2 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              <span className="block text-sm font-bold text-blue-700">عدد الطاقم</span>
                              <span className="text-blue-600">{vessel.crew_count}</span>
                            </div>
                            {vessel.passenger_count !== null && (
                              <div>
                                <span className="block text-sm font-bold text-blue-700">عدد الركاب</span>
                                <span className="text-blue-600">{vessel.passenger_count}</span>
                              </div>
                            )}
                            {vessel.pilgrim_count !== null && (
                              <div>
                                <span className="block text-sm font-bold text-blue-700">عدد المعتمرين</span>
                                <span className="text-blue-600">{vessel.pilgrim_count}</span>
                              </div>
                            )}
                            <div>
                              <span className="block text-sm font-bold text-blue-700">الموعد</span>
                              <span className="text-blue-600" dir="ltr">{formatDate(vessel.appointment)}</span>
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-blue-700">الوكيل</span>
                              <span className="text-blue-600">{vessel.agent}</span>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCopyDetails(vessel)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              نسخ التفاصيل
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}