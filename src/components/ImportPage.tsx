import React, { useState } from 'react';
import { FileImage, Loader2, Save, Trash2, Copy } from 'lucide-react';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';

interface ExtractedData {
  imo?: string;
  vesselName?: string;
  flag?: string;
  callSign?: string;
  crewCount?: string;
}

export function ImportPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const extractImportantData = (text: string): ExtractedData => {
    const patterns = {
      imo: /IMO\s*(?:No\.?|Number|#)?\s*[:.]?\s*(\d{7})/i,
      vesselName: /(?:VESSEL|SHIP)\s*NAME\s*[:.]?\s*([^\n]+)/i,
      flag: /FLAG\s*[:.]?\s*([^\n]+)/i,
      callSign: /CALL\s*SIGN\s*[:.]?\s*([^\n]+)/i,
      crewCount: /CREW\s*(?:LIST|NUMBER|COUNT)?\s*[:.]?\s*(\d+)/i,
    };

    const data: ExtractedData = {};
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        data[key as keyof ExtractedData] = match[1].trim();
      }
    });

    return data;
  };

  const handleExtractText = async () => {
    if (!image) {
      toast.error('يرجى تحميل صورة أولاً');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        image,
        'eng+ara',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              // يمكن إضافة شريط تقدم هنا
              console.log(`${(m.progress * 100).toFixed(2)}%`);
            }
          }
        }
      );

      setExtractedText(text);
      const data = extractImportantData(text);
      setExtractedData(data);
      
      if (Object.keys(data).length === 0) {
        toast.error('لم يتم العثور على بيانات في الصورة');
      } else {
        toast.success('تم استخراج البيانات بنجاح');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      toast.error('حدث خطأ أثناء استخراج النص');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyData = () => {
    if (!extractedData) return;

    const text = Object.entries(extractedData)
      .map(([key, value]) => {
        const labels: Record<string, string> = {
          imo: 'رقم IMO',
          vesselName: 'اسم الناقلة',
          flag: 'العلم',
          callSign: 'علامة النداء',
          crewCount: 'عدد الطاقم'
        };
        return `${labels[key]}: ${value}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text)
      .then(() => toast.success('تم نسخ البيانات'))
      .catch(() => toast.error('حدث خطأ أثناء نسخ البيانات'));
  };

  const handleDelete = () => {
    setImage(null);
    setExtractedText('');
    setExtractedData(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <FileImage className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">استيراد البيانات</h2>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <label className="block">
              <span className="sr-only">اختر صورة</span>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </label>
          </div>
        </div>

        {image && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={image}
                alt="Uploaded"
                className="max-h-96 mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="حذف الصورة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleExtractText}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الاستخراج...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    استخراج البيانات
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {extractedData && Object.keys(extractedData).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">البيانات المستخرجة</h3>
              <button
                onClick={handleCopyData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                نسخ البيانات
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(extractedData).map(([key, value]) => (
                <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="block text-sm font-bold text-blue-700 mb-1">
                    {key === 'imo' ? 'رقم IMO' :
                     key === 'vesselName' ? 'اسم الناقلة' :
                     key === 'flag' ? 'العلم' :
                     key === 'callSign' ? 'علامة النداء' :
                     key === 'crewCount' ? 'عدد الطاقم' : key}
                  </span>
                  <span className="text-blue-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}