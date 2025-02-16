import React, { useState } from 'react';
import { Save, Trash, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShiftDay {
  date: Date;
  dayName: string;
  employee: string;
}

interface EditorProps {
  employees: string[];
  onSave: (newShifts: ShiftDay[]) => void;
}

export function EditorPage({ employees, onSave }: EditorProps) {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [shifts, setShifts] = useState<ShiftDay[]>([]);

  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const generateShifts = () => {
    if (!startDate) {
      toast.error('يرجى اختيار تاريخ البداية');
      return;
    }

    let currentDate = new Date(startDate);
    let employeeIndex = employees.indexOf(selectedEmployee);
    const newShifts: ShiftDay[] = [];

    for (let i = 0; i < duration; i++) {
      newShifts.push({
        date: new Date(currentDate),
        dayName: arabicDays[currentDate.getDay()],
        employee: employees[employeeIndex]
      });

      employeeIndex = (employeeIndex + 1) % employees.length;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setShifts(newShifts);
    toast.success(`تم إنشاء جدول مناوبات ${duration} يوم`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Calendar className="w-6 h-6 text-blue-600 mr-2" />
        تحرير جدول المناوبات
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المدة (أيام)</label>
          <input
            type="number"
            value={duration}
            min={1}
            max={60}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المناوب الأول</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {employees.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={generateShifts} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        إنشاء الجدول
      </button>

      {shifts.length > 0 && (
        <>
          <table className="w-full text-sm mt-4">
            <thead>
              <tr>
                <th className="py-3 px-4">اليوم</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">المناوب</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, index) => (
                <tr key={index}>
                  <td className="py-2 px-4">{shift.dayName}</td>
                  <td className="py-2 px-4">{shift.date.toLocaleDateString('ar-SA')}</td>
                  <td className="py-2 px-4">{shift.employee}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex gap-2">
            <button onClick={() => onSave(shifts)} className="bg-green-600 text-white px-4 py-2 rounded-lg">
              <Save className="w-4 h-4" /> حفظ الجدول
            </button>
            <button onClick={() => setShifts([])} className="bg-red-600 text-white px-4 py-2 rounded-lg">
              <Trash className="w-4 h-4" /> مسح الجدول
            </button>
          </div>
        </>
      )}
    </div>
  );
}
