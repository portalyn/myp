import React, { useState, useEffect } from "react";
import { Calendar, Save, Plus, Trash, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { toHijri } from "hijri-converter"; // ✅ استيراد مكتبة تحويل التاريخ

interface ShiftDay {
  id?: number;
  date: string;
  employee: string;
}

export function Schedule() {
  const [shifts, setShifts] = useState<ShiftDay[]>([]);
  const [employees, setEmployees] = useState<{ name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [isContainerUnlocked, setIsContainerUnlocked] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState("1");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    fetchEmployeesFromSupabase();
    fetchShiftsFromSupabase();
  }, []);

  const fetchEmployeesFromSupabase = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("name")
      .order("name", { ascending: true });

    if (error) {
      toast.error("❌ خطأ أثناء تحميل الموظفين!");
    } else {
      setEmployees(data || []);
    }
  };

  const fetchShiftsFromSupabase = async () => {
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      toast.error("❌ خطأ أثناء تحميل المناوبات!");
    } else {
      setShifts(data || []);
    }
  };

  const handleAddShifts = async () => {
    if (!startDate || !numberOfDays || selectedEmployees.length === 0) {
      toast.error("يرجى إدخال تاريخ البداية، عدد الأيام، واختيار الموظفين");
      return;
    }

    const daysToAdd = parseInt(numberOfDays, 10);
    let currentDate = new Date(startDate);
    let employeeIndex = 0;

    let shiftsToInsert = [];

    for (let i = 0; i < daysToAdd; i++) {
      shiftsToInsert.push({
        date: currentDate.toISOString().split("T")[0],
        employee: selectedEmployees[employeeIndex],
      });

      currentDate.setDate(currentDate.getDate() + 1);
      employeeIndex = (employeeIndex + 1) % selectedEmployees.length;
    }

    const { error } = await supabase.from("shifts").insert(shiftsToInsert);

    if (error) {
      toast.error("❌ خطأ أثناء إضافة المناوبات!");
    } else {
      toast.success("✅ تمت إضافة المناوبات بنجاح");
      fetchShiftsFromSupabase();
      setShowForm(false);
    }
  };

  const clearShifts = async () => {
    if (!isContainerUnlocked) return;

    if (window.confirm("هل تريد تفريغ الجدول؟")) {
      const { error } = await supabase.from("shifts").delete().neq("id", 0);
      if (error) {
        toast.error("❌ خطأ أثناء تفريغ المناوبات!");
      } else {
        setShifts([]);
        toast.success("✅ تم التفريغ بنجاح");
      }
    }
  };

  const unlockContainer = () => {
    const password = prompt("أدخل كلمة المرور:");
    if (password === "66100") {
      setIsContainerUnlocked(true);
      toast.success("🔓 تم الفتح");
    } else {
      toast.error("❌ كلمة المرور خاطئة");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">📅 جدول المناوبات</h2>
          <div className="flex gap-2">
            <button onClick={unlockContainer} className={`p-2 rounded ${isContainerUnlocked ? "bg-green-500" : "bg-red-500"} text-white`}>
              {isContainerUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
            <button onClick={() => setShowForm(!showForm)} disabled={!isContainerUnlocked} className="p-2 bg-blue-600 text-white rounded disabled:opacity-50">
              <Plus className="w-5 h-5" /> إضافة
            </button>
            <button onClick={clearShifts} disabled={!isContainerUnlocked} className="p-2 bg-red-600 text-white rounded disabled:opacity-50">
              <Trash className="w-5 h-5" /> تفريغ
            </button>
          </div>
        </div>
        {showForm && (
  <div className="p-4 bg-gray-100 border mt-4">
    <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">👥 اختر الموظفين</label>
  <div className="grid grid-cols-2 gap-2 p-2 border rounded bg-gray-50">
    {employees.map((emp) => (
      <div key={emp.name} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedEmployees.includes(emp.name)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEmployees([...selectedEmployees, emp.name]);
            } else {
              setSelectedEmployees(selectedEmployees.filter((name) => name !== emp.name));
            }
          }}
        />
        <span>{emp.name}</span>
      </div>
    ))}

    {/* زر إضافة موظف جديد داخل القائمة */}
    <button
      onClick={() => {
        const newEmployee = prompt("🆕 أدخل اسم الموظف الجديد:");
        if (newEmployee) {
          setEmployees([...employees, { name: newEmployee }]);
          toast.success(`✅ تمت إضافة "${newEmployee}" بنجاح!`);
        }
      }}
      className="col-span-2 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
    >
      <Plus className="w-4 h-4" /> إضافة موظف جديد
    </button>
  </div>
</div>

    <div className="grid grid-cols-3 gap-4">
    <div>
        <label>📅 تاريخ البداية</label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
          className="w-full px-2 py-1 border rounded"
        />
      </div>
      <div>
        <label>📆 عدد الأيام</label>
        <input 
          type="number" 
          min="1" 
          value={numberOfDays} 
          onChange={(e) => setNumberOfDays(e.target.value)} 
          className="w-full px-2 py-1 border rounded"
        />
      </div>
    </div>
    <button 
      onClick={handleAddShifts} 
      className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
      ✔ حفظ
    </button>
  </div>
)}

<table className="w-full text-sm mt-4 border-collapse border rounded-lg shadow-lg">
  <thead className="bg-gray-200 text-gray-900">
    <tr>
      <th className="px-4 py-2">#</th>
      <th className="px-4 py-2">اليوم</th>
      <th className="px-4 py-2">التاريخ الميلادي</th>
      <th className="px-4 py-2">التاريخ الهجري</th>
      <th className="px-4 py-2">المناوب</th>
    </tr>
  </thead>
  <tbody>
    {shifts.map((shift, index) => {
      const shiftDate = new Date(shift.date);
      const hijriDate = toHijri(
        shiftDate.getFullYear(),
        shiftDate.getMonth() + 1,
        shiftDate.getDate()
      );
      const dayName = shiftDate.toLocaleDateString("ar-SA", { weekday: "long" });
      const isWeekend = dayName === "الجمعة" || dayName === "السبت";

      return (
        <tr
          key={index}
          className={`border ${
            isWeekend ? "bg-yellow-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"
          } text-gray-800`}
        >
          <td className="px-4 py-2 text-center font-semibold">{index + 1}</td>
          <td className="px-4 py-2 text-center">{dayName}</td>
          <td className="px-4 py-2 text-center">{shift.date}</td>
          <td className="px-4 py-2 text-center">{`${hijriDate.hy}-${hijriDate.hm}-${hijriDate.hd}`}</td>
          <td className="px-4 py-2 text-center font-semibold text-blue-900">
            {shift.employee}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

      </div>
    </div>
  );
}
