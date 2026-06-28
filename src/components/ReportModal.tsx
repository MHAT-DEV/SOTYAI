import { useState } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'KnowledgeObject' | 'SpacePost' | 'SpaceComment' | 'Identity';
  targetId: string;
  targetTitle: string;
  reporterId: string;
}

type ReportCategory = 'Spam' | 'Misleading' | 'Illegal' | 'Harassment' | 'Other';

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  reporterId
}: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>('Misleading');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('กรุณากรอกรายละเอียดสำหรับการรายงาน');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          targetTitle,
          reporterId,
          category,
          details: details.trim()
        })
      });

      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการส่งรายงาน');
      }

      setIsSuccess(true);
      setDetails('');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="report-modal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-100 animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                รายงานเนื้อหาคอมมูนิตี้ (Report Content)
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-950">ส่งรายงานสำเร็จแล้ว</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  ระบบได้รับรายงานของคุณแล้ว ทีมงานและบอทตรวจสอบจะประเมินคะแนนความน่าเชื่อถือตามหลักเกณฑ์ของคอมมูนิตี้ต่อไป
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Target Information */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-900 block mb-1">
                    เป้าหมายที่กำลังรายงาน:
                  </span>
                  <div className="font-mono bg-white border border-slate-150 rounded-md p-2.5 max-h-24 overflow-y-auto text-slate-800 break-words">
                    {targetTitle}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    ประเภท: {targetType} | ID: {targetId}
                  </span>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    ประเภทข้อผิดพลาด / ความเสียหาย
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Misleading', 'Illegal', 'Spam', 'Harassment', 'Other'] as ReportCategory[]).map((cat) => {
                      const labels: Record<ReportCategory, string> = {
                        Misleading: '🚫 ข้อมูลเท็จ / หลอกลวง',
                        Illegal: '⚖️ ผิดกฎหมาย',
                        Spam: '🗑️ สแปม / ขยะ',
                        Harassment: '🤬 คุกคาม / ส่อเสียด',
                        Other: '📝 อื่นๆ'
                      };
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-3 py-2 text-xs font-semibold text-left rounded-lg border transition-all cursor-pointer ${
                            category === cat
                              ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {labels[cat]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    รายละเอียดและหลักฐานเพิ่มเติม
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    placeholder="อธิบายเหตุผลที่คุณรายงานเนื้อหานี้อย่างชัดเจน (เช่น ลอกเลียนแบบ, ใช้คำหยาบ, มีเจตนาแชร์ข่าวปลอม หรือส่งผลร้ายต่อคอมมูนิตี้อย่างไร)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none focus:bg-white text-slate-800 leading-relaxed"
                    required
                  />
                </div>

                {error && (
                  <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    ยกเลิก (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? 'กำลังส่งรายงาน...' : 'ส่งรายงานเนื้อหา'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
