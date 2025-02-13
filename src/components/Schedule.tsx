import React, { useState } from 'react';
import { Calendar, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShiftDay {
  date: Date;
  dayName: string;
  employee: string;
}

export function Schedule() {
  // List of employees in rotation order
  const employees = ['نايف', 'عبيد', 'عوض', 'سند'];
  const [shifts, setShifts] = useState<ShiftDay[]>(() => generateInitialShifts());
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [startDate, setStartDate] = useState('');

  // Generate initial shifts from today until March 1st, 2025
  function generateInitialShifts(): ShiftDay[] {
    const dates: ShiftDay[] = [];
    const startDate = new Date();
    const endDate = new Date('2025-03-01');
    
    // Arabic day names
    const arabicDays = [
      'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
    ];

    let currentDate = startDate;
    let employeeIndex = 0;

    while (currentDate <= endDate) {
      dates.push({
        date: new Date(currentDate),
        dayName: arabicDays[currentDate.getDay()],
        employee: employees[employeeIndex]
      });

      // Move to next employee in rotation
      employeeIndex = (employeeIndex + 1) % employees.length;
      
      // Move to next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  const handleAddShifts = () => {
    if (!startDate || !selectedEmployee) {
      toast.error('الرجاء تعبئة جميع الحقول');
      return;
    }

    const newStartDate = new Date(startDate);
    const arabicDays = [
      'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
    ];

    // Find the starting employee index
    let employeeIndex = employees.indexOf(selectedEmployee);
    if (employeeIndex === -1) employeeIndex = 0;

    // Generate 30 days of shifts from the selected start date
    const newShifts: ShiftDay[] = [];
    let currentDate = new Date(newStartDate);

    for (let i = 0; i < 30; i++) {
      newShifts.push({
        date: new Date(currentDate),
        dayName: arabicDays[currentDate.getDay()],
        employee: employees[employeeIndex]
      });

      // Move to next employee in rotation
      employeeIndex = (employeeIndex + 1) % employees.length;
      
      // Move to next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Merge new shifts with existing ones and sort by date
    const allShifts = [...shifts, ...newShifts].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Remove duplicates based on date
    const uniqueShifts = allShifts.filter((shift, index, self) =>
      index === self.findIndex((s) => s.date.getTime() === shift.date.getTime())
    );

    setShifts(uniqueShifts);
    setShowForm(false);
    toast.success('تم إضافة المناوبات بنجاح');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">جدول المناوبات</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة مناوبات
          </button>
        </div>

        {showForm && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المناوب الأول
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {employees.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddShifts}
                  className="flex items-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  حفظ المناوبات
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-right font-medium text-gray-500">الرقم</th>
                <th className="py-3 px-4 text-right font-medium text-gray-500">اليوم</th>
                <th className="py-3 px-4 text-right font-medium text-gray-500">التاريخ</th>
                <th className="py-3 px-4 text-right font-medium text-gray-500">المناوب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shifts.map((shift, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-500">{index + 1}</td>
                  <td className="py-2 px-4">{shift.dayName}</td>
                  <td className="py-2 px-4" dir="ltr">{formatDate(shift.date)}</td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {shift.employee}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}