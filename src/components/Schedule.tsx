import React, { useState } from 'react';
import { Calendar, Save, Plus, Trash, Lock, Unlock, Edit, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShiftDay {
  date: Date;
  dayName: string;
  employee: string;
}

interface Period {
  startDate: Date;
  endDate: Date;
  shifts: ShiftDay[];
}

export function Schedule() {
  const [employees, setEmployees] = useState([
    { name: 'نايف', selected: true },
    { name: 'عبيد', selected: true },
    { name: 'عوض', selected: true },
    { name: 'سند', selected: true }
  ]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');
  const [isContainerUnlocked, setIsContainerUnlocked] = useState(false);

  // Generate initial shifts from today until March 1st, 2025
  function generateInitialShifts(): ShiftDay[] {
    const dates: ShiftDay[] = [];
    const startDate = new Date();
    const endDate = new Date('2025-03-01');
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    let currentDate = startDate;
    let employeeIndex = 0;

    while (currentDate <= endDate) {
      dates.push({
        date: new Date(currentDate),
        dayName: arabicDays[currentDate.getDay()],
        employee: employees[employeeIndex % employees.length].name
      });
      employeeIndex++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  // Add initial shifts on component mount
  React.useEffect(() => {
    const initialShifts = generateInitialShifts();
    if (initialShifts.length > 0) {
      const endDate = new Date('2025-03-01');
      setPeriods([{ startDate: new Date(), endDate, shifts: initialShifts }]);
    }
  }, []);

  const handleAddShifts = () => {
    if (!startDate || !numberOfDays) {
      toast.error('املأ جميع الحقول');
      return;
    }

    const daysToAdd = parseInt(numberOfDays, 10);
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
      toast.error('عدد الأيام غير صحيح');
      return;
    }

    const newStartDate = new Date(startDate);
    const newShifts = generateShiftsForPeriod(newStartDate, daysToAdd);

    if (newShifts.length > 0) {
      const endDate = new Date(newStartDate);
      endDate.setDate(endDate.getDate() + daysToAdd - 1);

      setPeriods([...periods, { startDate: newStartDate, endDate, shifts: newShifts }]);
      setShowForm(false);
      toast.success('تمت الإضافة بنجاح');
    }
  };

  const clearShifts = () => {
    if (window.confirm('هل تريد تفريغ الجدول؟')) {
      setPeriods([]);
      toast.success('تم التفريغ بنجاح');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const unlockContainer = () => {
    const password = prompt('أدخل كلمة المرور:');
    if (password === '66100') {
      setIsContainerUnlocked(true);
      toast.success('تم الفتح');
    } else {
      toast.error('كلمة المرور خاطئة');
    }
  };

  const toggleEmployeeSelection = (name: string) => {
    setEmployees(prev =>
      prev.map(emp => (emp.name === name ? { ...emp, selected: !emp.selected } : emp))
    );
  };

  const addEmployee = () => {
    const newEmployee = prompt('اسم المناوب الجديد:');
    if (newEmployee && !employees.some(emp => emp.name === newEmployee)) {
      setEmployees([...employees, { name: newEmployee, selected: true }]);
      toast.success(`تمت إضافة "${newEmployee}"`);
    } else {
      toast.error('الاسم موجود أو غير صحيح');
    }
  };

  const editEmployee = (oldName: string) => {
    const newName = prompt('اسم المناوب الجديد:', oldName);
    if (newName && newName !== oldName && !employees.some(emp => emp.name === newName)) {
      setEmployees(prev =>
        prev.map(emp => (emp.name === oldName ? { ...emp, name: newName } : emp))
      );
      toast.success(`تم التعديل إلى "${newName}"`);
    } else {
      toast.error('الاسم موجود أو غير صحيح');
    }
  };

  const deleteEmployee = (name: string) => {
    if (window.confirm(`حذف "${name}"؟`)) {
      setEmployees(employees.filter(emp => emp.name !== name));
      toast.success(`تم حذف "${name}"`);
    }
  };

  const generateShiftsForPeriod = (startDate: Date, numberOfDays: number): ShiftDay[] => {
    const dates: ShiftDay[] = [];
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const selectedEmployees = employees.filter(emp => emp.selected).map(emp => emp.name);

    if (selectedEmployees.length === 0) {
      toast.error('حدد مناوباً واحداً على الأقل');
      return [];
    }

    let currentDate = new Date(startDate);
    let employeeIndex = 0;

    for (let i = 0; i < numberOfDays; i++) {
      dates.push({
        date: new Date(currentDate),
        dayName: arabicDays[currentDate.getDay()],
        employee: selectedEmployees[employeeIndex]
      });
      employeeIndex = (employeeIndex + 1) % selectedEmployees.length;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">جدول المناوبات</h2>
          </div>
          <div className="flex gap-2">
            {isContainerUnlocked ? (
              <button onClick={unlockContainer} className="p-1 bg-green-500 text-white rounded">
                <Unlock className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={unlockContainer} className="p-1 bg-red-500 text-white rounded">
                <Lock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-1 p-1 ${
                isContainerUnlocked ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              } text-white rounded hover:bg-blue-700 transition-colors`}
              disabled={!isContainerUnlocked}
            >
              <Plus className="w-4 h-4" /> إضافة
            </button>
            <button
              onClick={clearShifts}
              className={`flex items-center gap-1 p-1 ${
                isContainerUnlocked ? 'bg-red-600' : 'bg-gray-400 cursor-not-allowed'
              } text-white rounded hover:bg-red-700 transition-colors`}
              disabled={!isContainerUnlocked}
            >
              <Trash className="w-4 h-4" /> تفريغ
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأيام</label>
                <input
                  type="number"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(e.target.value)}
                  min="1"
                  className="w-full px-3 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddShifts}
                  className="flex items-center gap-1 w-full p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" /> حفظ
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-right font-medium text-gray-500">اليوم</th>
                <th className="py-2 px-4 text-right font-medium text-gray-500">التاريخ</th>
                <th className="py-2 px-4 text-right font-medium text-gray-500">المناوب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {periods.flatMap((period) =>
                period.shifts.map((shift, index) => (
                  <tr key={`${period.startDate}-${index}`} className="hover:bg-gray-50">
                    <td className="py-2 px-4">{shift.dayName}</td>
                    <td className="py-2 px-4" dir="ltr">{formatDate(shift.date)}</td>
                    <td className="py-2 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {shift.employee}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* إدارة المناوبين */}
      <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">إدارة المناوبين</h3>
        <div className="flex flex-wrap gap-2">
          {employees.map((emp, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emp.selected}
                onChange={() => toggleEmployeeSelection(emp.name)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>{emp.name}</span>
              <button
                onClick={() => editEmployee(emp.name)}
                className="p-1 text-blue-500 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteEmployee(emp.name)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addEmployee}
          className="flex items-center gap-1 p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة مناوب
        </button>
      </div>
    </div>
  );
}