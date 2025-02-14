import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { BarChart2, Search, User, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vessel {
  id: string;
  vessel_name: string;
  flag: string;
  coming_from: string;
  heading_to: string;
  crew_count: number;
  passenger_count: number | null;
  pilgrim_count: number | null;
  entered_by: string;
  arrival_date: string;
}

interface MonthlyCount {
  month: number;
  count: number;
}

interface UserCount {
  entered_by: string;
  count: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export function Statistics() {
  const [monthlyData, setMonthlyData] = useState<MonthlyCount[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyCount | null>(null);
  const [monthlyVessels, setMonthlyVessels] = useState<Vessel[]>([]);
  const [userCounts, setUserCounts] = useState<UserCount[]>([]);
  const [showUserStats, setShowUserStats] = useState(false);
  const [showDateSearch, setShowDateSearch] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [searchResults, setSearchResults] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastThreeMonthsData, setLastThreeMonthsData] = useState<Vessel[]>([]);
  const [showLastThreeMonths, setShowLastThreeMonths] = useState(false);

  useEffect(() => {
    fetchStatistics();
  
    // ✅ اشترك في تحديثات الجدول وتحديث الإحصائيات عند أي تغيير
    const subscription = supabase
      .channel('vessels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vessels' }, () => {
        fetchStatistics();
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  

  const getMonthName = (month: number) => {
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return monthNames[month - 1];
  };

  const fetchStatistics = async () => {
    try {
      const { data: vessels, error } = await supabase
        .from('vessels')
        .select('*')
        .not('entered_by', 'is', null);

      if (error) throw error;

      // Process monthly statistics
      const monthCounts = new Map<number, number>();
      const userCountMap = new Map<string, number>();

vessels.forEach(vessel => {
  if (vessel.entered_by) {
    userCountMap.set(vessel.entered_by, (userCountMap.get(vessel.entered_by) || 0) + 1);
  }
});

const userStats = Array.from(userCountMap.entries())
  .map(([entered_by, count]) => ({ entered_by, count }))
  .sort((a, b) => b.count - a.count);

setUserCounts(userStats);

      

      vessels.forEach(vessel => {
        const date = new Date(vessel.arrival_date + 'T00:00:00Z'); // التعامل مع التوقيت UTC
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // تعديل للتوقيت المحلي
        
        const month = date.getMonth() + 1;
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    });
    

      const monthlyStats = Array.from(monthCounts.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month - b.month);

    

      setMonthlyData(monthlyStats);
      setUserCounts(userStats);
    } catch (error: any) {
      toast.error(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLastThreeMonths = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .not('entered_by', 'is', null)
        .gte('arrival_date', startDate.toISOString().split('T')[0])
        .lte('arrival_date', endDate.toISOString().split('T')[0])
        .order('arrival_date', { ascending: false });

      if (error) throw error;
      setLastThreeMonthsData(data);
      setShowLastThreeMonths(true);
      setSelectedMonth(null);
      setSearchResults([]);
    } catch (error: any) {
      toast.error(handleSupabaseError(error));
    }
  };

  const fetchMonthlyVessels = async (month: number) => {
    try {
      const startDate = new Date(Date.UTC(new Date().getFullYear(), month - 1, 1)).toISOString().split('T')[0];
const endDate = new Date(Date.UTC(new Date().getFullYear(), month, 0)).toISOString().split('T')[0];


      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .not('entered_by', 'is', null)
        .gte('arrival_date', startDate)
        .lte('arrival_date', endDate);

      if (error) throw error;
      setMonthlyVessels(data);
    } catch (error: any) {
      toast.error(handleSupabaseError(error));
    }
  };

  const handleMonthClick = async (monthData: MonthlyCount) => {
    setShowLastThreeMonths(false);
    if (selectedMonth?.month === monthData.month) {
      setSelectedMonth(null);
      setMonthlyVessels([]);
    } else {
      setSelectedMonth(monthData);
      await fetchMonthlyVessels(monthData.month);
    }
  };

  const handleDateSearch = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('يرجى تحديد تاريخ البداية والنهاية');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .not('entered_by', 'is', null)
        .gte('arrival_date', dateRange.startDate)
        .lte('arrival_date', dateRange.endDate);

      if (error) throw error;
      setSearchResults(data);
      setSelectedMonth(null);
      setShowLastThreeMonths(false);
    } catch (error: any) {
      toast.error(handleSupabaseError(error));
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

  const exportToExcel = (vessels: Vessel[]) => {
    const headers = [
      'الرقم',
      'اسم الناقلة',
      'العلم',
      'قادمة من',
      'متجهة إلى',
      'عدد الطاقم',
      'عدد الركاب',
      'عدد المعتمرين',
      'تاريخ الوصول',
      'المدخل'
    ];

    const rows = vessels.map((vessel, index) => [
      (index + 1).toString(),
      vessel.vessel_name,
      vessel.flag,
      vessel.coming_from,
      vessel.heading_to,
      vessel.crew_count.toString(),
      (vessel.passenger_count || '').toString(),
      (vessel.pilgrim_count || '').toString(),
      formatDate(vessel.arrival_date),
      vessel.entered_by
    ]);

    const xmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Sheet1</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayRightToLeft/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            td { mso-number-format: "@"; }
            .number { mso-number-format: "0"; }
            .date { mso-number-format: "dd/mm/yyyy"; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  <td class="number">${row[0]}</td>
                  <td>${row[1]}</td>
                  <td>${row[2]}</td>
                  <td>${row[3]}</td>
                  <td>${row[4]}</td>
                  <td class="number">${row[5]}</td>
                  <td class="number">${row[6]}</td>
                  <td class="number">${row[7]}</td>
                  <td class="date">${row[8]}</td>
                  <td>${row[9]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + xmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'بيانات_الناقلات.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير البيانات بنجاح');
  };

  const renderVesselTable = (vessels: Vessel[]) => (
    <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {selectedMonth 
            ? `ناقلات شهر ${getMonthName(selectedMonth.month)}`
            : showLastThreeMonths
            ? 'ناقلات آخر 3 أشهر'
            : 'نتائج البحث'}
        </h3>
        <button
          onClick={() => exportToExcel(vessels)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          تصدير Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الرقم</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الناقلة</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">العلم</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">قادمة من</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">متجهة إلى</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">عدد الطاقم</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الركاب</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">المعتمرين</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">تاريخ الوصول</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vessels.map((vessel, index) => (
              <tr key={vessel.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                <td className="px-4 py-2 text-sm">{vessel.vessel_name}</td>
                <td className="px-4 py-2 text-sm">{vessel.flag}</td>
                <td className="px-4 py-2 text-sm">{vessel.coming_from}</td>
                <td className="px-4 py-2 text-sm">{vessel.heading_to}</td>
                <td className="px-4 py-2 text-sm">{vessel.crew_count}</td>
                <td className="px-4 py-2 text-sm">{vessel.passenger_count || '-'}</td>
                <td className="px-4 py-2 text-sm">{vessel.pilgrim_count || '-'}</td>
                <td className="px-4 py-2 text-sm" dir="ltr">
                  {formatDate(vessel.arrival_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUserStats = () => {
    const itemsPerRow = 3;
    const rows = [];
    
    for (let i = 0; i < 2; i++) {
      const rowItems = userCounts.slice(i * itemsPerRow, (i + 1) * itemsPerRow);
      rows.push(
        <tr key={i}>
          {rowItems.map((user) => (
            <td key={user.entered_by} className="p-4 border">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{user.entered_by}</div>
                <div className="text-sm text-gray-600 mt-1">عدد الناقلات: {user.count}</div>
              </div>
            </td>
          ))}
          {[...Array(itemsPerRow - rowItems.length)].map((_, index) => (
            <td key={`empty-${index}`} className="p-4 border"></td>
          ))}
        </tr>
      );
    }

    return (
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">إحصائيات المدخلين</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border rounded-lg bg-white">
            <tbody className="divide-y divide-gray-200">
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    );
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <BarChart2 className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">الإحصائيات</h2>
        </div>

        {/* Monthly Data Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {monthlyData.map((monthData) => (
            <button
              key={monthData.month}
              onClick={() => handleMonthClick(monthData)}
              className={`p-4 rounded-lg transition-colors ${
                selectedMonth?.month === monthData.month
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border-2 border-blue-200 hover:bg-blue-50 text-gray-900'
              }`}
            >
              <div className="text-lg font-medium">{getMonthName(monthData.month)}</div>
              <div className="text-sm opacity-75">عدد الناقلات: {monthData.count}</div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => {
              setShowUserStats(!showUserStats);
              setShowDateSearch(false);
              setSearchResults([]);
              setShowLastThreeMonths(false);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <User className="w-5 h-5" />
            <span>إحصائيات المدخلين</span>
          </button>
          <button
            onClick={() => {
              setShowDateSearch(!showDateSearch);
              setShowUserStats(false);
              setSearchResults([]);
              setShowLastThreeMonths(false);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span>بحث بين تاريخين</span>
          </button>
          <button
            onClick={() => {
              fetchLastThreeMonths();
              setShowDateSearch(false);
              setShowUserStats(false);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <BarChart2 className="w-5 h-5" />
            <span>آخر 3 أشهر</span>
          </button>
        </div>

        {showUserStats && renderUserStats()}

        {showDateSearch && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">البحث بين تاريخين</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleDateSearch}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  بحث
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedMonth && monthlyVessels.length > 0 && renderVesselTable(monthlyVessels)}
        {searchResults.length > 0 && renderVesselTable(searchResults)}
        {showLastThreeMonths && lastThreeMonthsData.length > 0 && renderVesselTable(lastThreeMonthsData)}
      </div>
    </div>
  );
}