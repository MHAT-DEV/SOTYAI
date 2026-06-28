import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Report } from '../types';
import { AlertTriangle, CheckCircle, ShieldAlert, Clock, RefreshCw, Eye, Check, XCircle, Trash2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReportsCenter() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Resolved' | 'Dismissed'>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, newStatus: Report['status']) => {
    setUpdatingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error('Error updating report status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('คุณต้องการลบรายการรายงานนี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  const getCategoryBadgeColor = (category: Report['category']) => {
    switch (category) {
      case 'Illegal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Misleading':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Spam':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Harassment':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusBadgeColor = (status: Report['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dismissed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
    }
  };

  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            รายงานความเสียหายและการบิดเบือนข้อมูล
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Community Reports & Dispute Resolution Desk (ศูนย์ดูแลความโปร่งใสและความถูกต้องของข้อมูล)
          </p>
        </div>
        <button 
          onClick={fetchReports}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-full border border-slate-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950">{reports.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายงานทั้งหมด</div>
          </div>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-full border border-rose-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-700">{pendingCount}</div>
            <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">รอดำเนินการ (Pending)</div>
          </div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">{resolvedCount}</div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">แก้ไขแล้ว (Resolved)</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl inline-flex border border-slate-200">
        {(['All', 'Pending', 'Resolved', 'Dismissed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              statusFilter === tab
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'All' ? 'ทั้งหมด' : tab === 'Pending' ? '⚠️ รอดำเนินการ' : tab === 'Resolved' ? '✅ แก้ไขแล้ว' : '⚪ ยกเลิกรายงาน'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">กำลังโหลดข้อมูลการรายงาน...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500 space-y-2">
          <CheckCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">ไม่มีรายงานในหมวดหมู่นี้</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">คอมมูนิตี้ของคุณอยู่ในความโปร่งใสและไม่มีรายการรายงานผิดกฎระเบียบที่รอดำเนินการ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(report => (
            <div 
              key={report.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                report.status === 'Pending' ? 'border-rose-100 hover:border-rose-200' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-md font-bold border text-[10px] uppercase tracking-wider ${getCategoryBadgeColor(report.category)}`}>
                      {report.category === 'Misleading' ? '🚫 บิดเบือนข้อมูล' : report.category === 'Illegal' ? '⚖️ ผิดกฎหมาย' : report.category === 'Spam' ? '🗑️ สแปม / ก่อกวน' : report.category === 'Harassment' ? '🤬 คุกคาม' : '📝 อื่นๆ'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md font-bold border text-[10px] uppercase tracking-wider ${getStatusBadgeColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Target info */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">เป้าหมายที่ถูกรายงาน:</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-mono">
                        {report.targetType}
                      </span>
                      {report.targetType === 'KnowledgeObject' ? (
                        <Link 
                          to={`/knowledge/${report.targetId}`}
                          className="font-extrabold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1 text-sm sm:text-base leading-snug"
                        >
                          {report.targetTitle}
                          <ArrowRight className="w-4 h-4 shrink-0 text-slate-400" />
                        </Link>
                      ) : (
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                          {report.targetTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
                    <div className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                      เหตุผลและหลักฐานที่ผู้รายงานระบุ:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
                      {report.details}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span>รายงานโดย:</span>
                      <strong className="text-slate-700">{report.reporterName}</strong>
                      <span>• ID:</span>
                      <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-600">{report.reporterId}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  {report.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'Resolved')}
                        disabled={updatingId === report.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        แก้ไขเรียบร้อย
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'Dismissed')}
                        disabled={updatingId === report.id}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        ยกเลิกข้อกล่าวหา
                      </button>
                    </>
                  )}

                  {report.status !== 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'Pending')}
                      disabled={updatingId === report.id}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      เปิดการตรวจสอบอีกครั้ง
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors md:mt-2"
                    title="ลบรายงานนี้อย่างถาวร"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
