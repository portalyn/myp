import React, { useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Ship } from 'lucide-react';
import { ArrivalForm } from './ArrivalForm';
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
  updated_at: string;
}

interface WaitingListProps {
  onArrivalSuccess: (vesselId: string) => void;
}

export function WaitingList({ onArrivalSuccess }: WaitingListProps) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('appointment', { ascending: true });

      if (error) throw error;
      
      const waitingVessels = (data || []).filter(vessel => !vessel.entered_by);
      setVessels(waitingVessels);
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
        <ArrivalForm
          vessel={selectedVessel}
          onClose={() => setSelectedVessel(null)}
          onSuccess={(vesselId) => {
            onArrivalSuccess(vesselId);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <Ship className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">الانتظار</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-2 text-right font-medium text-gray-500">الناقلة</th>
                  <th className="py-3 px-2 text-right font-medium text-gray-500">الموعد</th>
                  <th className="py-3 px-2 text-right font-medium text-gray-500">الوكيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vessels.map((vessel) => (
                  <tr
                    key={vessel.id}
                    onClick={() => setSelectedVessel(vessel)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2 whitespace-nowrap">{vessel.vessel_name}</td>
                    <td className="py-2 px-2 whitespace-nowrap text-gray-500 text-xs" dir="ltr">
                      {formatDate(vessel.appointment)}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap text-gray-500">{vessel.agent}</td>
                  </tr>
                ))}
                {vessels.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      لا توجد ناقلات في قائمة الانتظار
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}