import React, { useState, useEffect } from 'react';
import { Calendar, Save, Plus, Trash, Download, Lock, Unlock, CheckSquare, Edit } from 'lucide-react';
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
  // استعادة البيانات من localStorage عند التحميل
  const [employees, setEmployees] = useState<{ name: string; selected: boolean }[]>(() => {
    const savedEmployees = localStorage.getItem('employees');
    return savedEmployees ? JSON.parse(savedEmployees) : [
      { name: 'نايف', selected: true },
      { name: 'عبيد', selected: true },
      { name: 'عوض', selected: true },
      { name: 'سند', selected: true }
    ];
  });

  const [periods, setPeriods] = useState<Period[]>(() => {
    const savedPeriods = localStorage.getItem('periods');
    return savedPeriods ? JSON.parse(savedPeriods, (key, value) => {
      if (key === 'date' || key === 'startDate' || key === 'endDate') {
        return new Date(value);
      }
      return value;
    }) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');
  const [isContainerUnlocked, setIsContainerUnlocked] = useState(false);

  // حفظ البيانات في localStorage عند التحديث
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('periods', JSON.stringify(periods));
  }, [periods]);

  // باقي الكود بدون تغيير
  function generateShiftsForPeriod(startDate: Date, numberOfDays: number): ShiftDay[] {
    const dates: ShiftDay[] = [];
    const arabicDays = [
      'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
    ];
    const selectedEmployees = employees.filter(emp => emp.selected).map(emp => emp.name);

    if (selectedEmployees.length === 0) {
      toast.error('يجب تحديد مناوب واحد على الأقل');
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
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  const handleAddShifts = () => {
    if (!startDate || !numberOfDays) {
      toast.error('الرجاء تعبئة جميع الحقول');
      return;
    }

    const daysToAdd = parseInt(numberOfDays, 10);
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
      toast.error('الرجاء إدخال عدد أيام صالح');
      return;
    }

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + daysToAdd - 1);

    const newShifts = generateShiftsForPeriod(newStartDate, daysToAdd);

    if (newShifts.length === 0) return;

    const newPeriod: Period = {
      startDate: newStartDate,
      endDate: newEndDate,
      shifts: newShifts
    };

    setPeriods([...periods, newPeriod]);
    setShowForm(false);
    toast.success(`تم إضافة ${daysToAdd} من المناوبات بنجاح`);
  };

  // باقي الكود بدون تغيير
  const clearShifts = () => {
    if (window.confirm('هل أنت متأكد من أنك تريد تفريغ جميع المناوبات؟')) {
      setPeriods([]);
      toast.success('تم تفريغ جميع المناوبات بنجاح');
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
    const password = prompt('أدخل كلمة المرور لفتح الحاوية:');
    console.log('كلمة المرور المدخلة:', password); // تحقق من كلمة المرور
    if (password === '66100') {
      setIsContainerUnlocked(true);
      toast.success('تم فتح الحاوية بنجاح');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  const toggleEmployeeSelection = (name: string) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.name === name ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  const addEmployee = () => {
    const newEmployee = prompt('أدخل اسم المناوب الجديد:');
    if (newEmployee && !employees.some(emp => emp.name === newEmployee)) {
      setEmployees([...employees, { name: newEmployee, selected: true }]);
      toast.success(`تم إضافة المناوب "${newEmployee}" بنجاح`);
    } else {
      toast.error('اسم المناوب موجود بالفعل أو غير صحيح');
    }
  };

  const editEmployee = (oldName: string) => {
    const newName = prompt('أدخل الاسم الجديد للمناوب:', oldName);
    if (newName && newName !== oldName && !employees.some(emp => emp.name === newName)) {
      setEmployees(prev =>
        prev.map(emp =>
          emp.name === oldName ? { ...emp, name: newName } : emp
        )
      );
      toast.success(`تم تعديل اسم المناوب "${oldName}" إلى "${newName}" بنجاح`);
    } else {
      toast.error('اسم المناوب موجود بالفعل أو غير صحيح');
    }
  };

  const deletePeriod = (index: number) => {
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذه الفترة؟')) {
      const updatedPeriods = periods.filter((_, i) => i !== index);
      setPeriods(updatedPeriods);
      toast.success('تم حذف الفترة بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">جدول المناوبات</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert('تصدير PDF غير متاح مؤقتًا')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              تصدير PDF
            </button>

            <div
              onClick={unlockContainer}
              className={`flex gap-2 items-center border-2 border-dashed ${
                isContainerUnlocked ? 'border-green-500' : 'border-gray-400'
              } p-2 rounded-lg cursor-pointer`}
            >
              {isContainerUnlocked ? (
                <Unlock className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500" />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isContainerUnlocked) setShowForm(!showForm);
                }}
                className={`flex items-center gap-2 ${
                  isContainerUnlocked ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
                } text-white px-4 py-2 rounded-lg transition-colors`}
                disabled={!isContainerUnlocked}
              >
                <Plus className="w-4 h-4" />
                إضافة مناوبات
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isContainerUnlocked) clearShifts();
                }}
                className={`flex items-center gap-2 ${
                  isContainerUnlocked ? 'bg-red-600' : 'bg-gray-400 cursor-not-allowed'
                } text-white px-4 py-2 rounded-lg transition-colors`}
                disabled={!isContainerUnlocked}
              >
                <Trash className="w-4 h-4" />
                تفريغ الخلايا
              </button>
            </div>
          </div>
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
                  عدد الأيام
                </label>
                <input
                  type="number"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(e.target.value)}
                  min="1"
                  placeholder="أدخل عدد الأيام"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المناوبون المختارون
                </label>
                <ul className="space-y-2">
                  {employees.map((emp, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={emp.selected}
                          onChange={() => toggleEmployeeSelection(emp.name)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>{emp.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editEmployee(emp.name)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من أنك تريد حذف المناوب "${emp.name}"؟`)) {
                              setEmployees(employees.filter(e => e.name !== emp.name));
                              toast.success(`تم حذف المناوب "${emp.name}" بنجاح`);
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={addEmployee}
                  className="flex items-center gap-2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
                >
                  <Plus className="w-4 h-4" />
                  إضافة مناوب
                </button>
              </div>
              <div className="flex items-end col-span-1 md:col-span-3">
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

        <div className="space-y-6 mt-4">
          {periods.map((period, periodIndex) => (
            <div key={periodIndex} className="bg-white rounded-lg shadow-md p-4 relative">
              <button
                onClick={() => deletePeriod(periodIndex)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                المناوبات من {formatDate(period.startDate)} إلى {formatDate(period.endDate)}
              </h3>

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
                    {period.shifts.map((shift, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}