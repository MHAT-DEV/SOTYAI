import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Identity } from '../types';
import { 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Upload, 
  FileText, 
  Check, 
  CheckCircle2, 
  RotateCcw, 
  FileCode, 
  BookOpen, 
  Sparkles, 
  Layers, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface CreateKnowledgeProps {
  identity: Identity | null;
}

interface ExtractedBlock {
  id: string;
  title: string;
  content: string;
  mappedTo?: string;
}

export default function CreateKnowledge({ identity }: CreateKnowledgeProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entryMode, setEntryMode] = useState<'manual' | 'import'>('manual');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    context: '',
    solution: '',
    evidence: '',
    tags: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload & Mapper State
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractedBlocks, setExtractedBlocks] = useState<ExtractedBlock[]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({}); // blockId -> fieldName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    
    const newKnowledge = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: identity?.id || 'anonymous',
      references: [] // Simplified for MVP
    };

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKnowledge)
      });
      const data = await res.json();
      navigate(`/knowledge/${data.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setAnalyzing(true);
    setExtractedBlocks([]);
    setMappedFields({});
    
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string || '';
      let blocks: ExtractedBlock[] = [];

      if (file.name.endsWith('.csv')) {
        // Parse CSV Rows
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        blocks = lines.slice(0, 8).map((line, idx) => {
          const cells = line.split(',');
          return {
            id: `block_${idx}`,
            title: `แถวที่ ${idx + 1} (Row ${idx + 1})`,
            content: cells.join(' | ')
          };
        });
      } else if (file.name.endsWith('.txt')) {
        // Parse TXT by paragraphs
        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        blocks = paragraphs.slice(0, 8).map((para, idx) => {
          return {
            id: `block_${idx}`,
            title: `ส่วนที่ ${idx + 1} (Section ${idx + 1})`,
            content: para
          };
        });
      } else {
        // PDF, DOC, DOCX structure analysis simulation
        const baseName = file.name.split('.')[0].replace(/[-_]/g, ' ');
        blocks = [
          {
            id: 'block_1',
            title: 'หัวข้อเนื้อหา (Extracted Title)',
            content: `${baseName}`
          },
          {
            id: 'block_2',
            title: 'ข้อผิดพลาดและปัญหาสนับสนุน (Identified Problem Statement)',
            content: `การทำงานบนแพลตฟอร์มที่ล้าสมัยก่อให้เกิดความไม่เที่ยงตรงของข้อมูลสารสนเทศ ตลอดจนการขาดกลไกตรวจสอบวิเคราะห์ที่โปร่งใสในกลุ่มคอมมูนิตี้`
          },
          {
            id: 'block_3',
            title: 'บริบทและข้อมูลระบบ (Context and Background Info)',
            content: `ระบบจัดทำขึ้นตามเกณฑ์วิเคราะห์แบบไร้ศูนย์กลาง (Decentralized Network Validation) มีความต้องการในการตรวจสอบข้อมูลให้ถูกต้องเกินกว่า 95%`
          },
          {
            id: 'block_4',
            title: 'ทางออกและการตอบสนอง (Solution & Execution Plan)',
            content: `พัฒนาระบบตรวจสอบคะแนนความน่าเชื่อถือ Trust Score ร่วมกับ Multi-dimensional evaluation และระบบรับรองเอกสารรายงานเพื่อคัดกรองเนื้อหาอันตราย`
          },
          {
            id: 'block_5',
            title: 'ตัวชี้วัดความน่าเชื่อถือ (Evidence & Verification Proof)',
            content: `ผลวิจัยทดลองใช้อัลกอริทึมคัดกรองพบลดการสแปมและข้อมูลบิดเบือนได้ถึง 42% ในระยะเวลาการทดสอบ 30 วันแรก`
          },
          {
            id: 'block_6',
            title: 'คำสำคัญ (Keywords / Mapped Tags)',
            content: 'Decentralization, Security Rules, Community Filtering, Integrity'
          }
        ];
      }

      // Simulate a smart parser progress bar
      setTimeout(() => {
        setExtractedBlocks(blocks);
        setAnalyzing(false);
        setUploadedFileName(file.name);
      }, 1500);
    };

    if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      // PDF or DOC
      reader.readAsArrayBuffer(file);
    }
  };

  const handleMapField = (blockId: string, fieldName: string) => {
    // 1. Update mapping state
    setMappedFields(prev => ({
      ...prev,
      [blockId]: fieldName
    }));

    // 2. Find block content
    const block = extractedBlocks.find(b => b.id === blockId);
    if (block) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: block.content
      }));
    }
  };

  const handleResetMapping = () => {
    setUploadedFileName(null);
    setExtractedBlocks([]);
    setMappedFields({});
    setFormData({
      title: '',
      problem: '',
      context: '',
      solution: '',
      evidence: '',
      tags: ''
    });
  };

  if (!identity) return <div className="text-center py-12 text-slate-500">Loading profile data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-blue-50 border-b border-blue-100 p-6 flex items-start gap-4">
          <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 shrink-0 border border-blue-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              สร้าง Knowledge Object ใหม่
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              คุณกำลังร่วมแบ่งปันความรู้ในนามของ <strong className="text-slate-900">{identity.name}</strong> ({identity.type}) 
              ความรู้ที่สร้างขึ้นจะถูกวิเคราะห์ความน่าเชื่อถือโดย Trust Engine ของแพลตฟอร์มโดยอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 p-2 bg-slate-50/50 gap-2">
          <button
            onClick={() => setEntryMode('manual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              entryMode === 'manual'
                ? 'bg-white text-blue-600 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            กรอกข้อมูลเอง (Manual Form)
          </button>
          <button
            onClick={() => setEntryMode('import')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              entryMode === 'import'
                ? 'bg-white text-blue-600 border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            ดึงข้อมูลจากเอกสาร (Document Parser)
          </button>
        </div>
      </div>

      {entryMode === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* File Upload Zone / Blocks Column (LEFT) */}
          <div className="lg:col-span-5 space-y-4">
            
            {!uploadedFileName && !analyzing && (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`bg-white border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-blue-500 bg-blue-50/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".doc,.docx,.pdf,.csv,.txt"
                />
                <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">อัปโหลดไฟล์คู่มือหรือข้อมูล (.doc, .csv, .pdf, .txt)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อค้นหาไฟล์ในอุปกรณ์ของคุณ เพื่อทำการสกัดและวิเคราะห์ฟิลด์
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-150 py-1.5 px-3 rounded-lg w-max mx-auto shadow-xs">
                  <FileCode className="w-3.5 h-3.5" /> TXT / CSV รองรับการอ่านข้อมูลสด
                </div>
              </div>
            )}

            {analyzing && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto border border-purple-100 animate-spin">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-950">กำลังประมวลผลข้อมูลเอกสาร...</h3>
                  <p className="text-xs text-slate-500">บอทวิเคราะห์กำลังคัดกรองส่วนของข้อความเพื่อสร้างบล็อกข้อมูลในการเชื่อมโยง</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full animate-pulse" style={{ width: '80%' }}></div>
                </div>
              </div>
            )}

            {uploadedFileName && extractedBlocks.length > 0 && (
              <div className="space-y-4">
                
                {/* Active File Header */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0 border border-purple-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">สกัดโครงสร้างสำเร็จแล้ว</div>
                      <div className="text-xs text-slate-700 font-extrabold truncate max-w-[180px] sm:max-w-[240px]" title={uploadedFileName}>
                        {uploadedFileName}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleResetMapping}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title="ล้างข้อมูลไฟล์นี้"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
                  เลือกฟิลด์ทางขวาในดร็อปดาวน์ใต้แต่ละบล็อก เพื่อลิงก์ข้อความไปเติมในแบบฟอร์มเว็บไซต์โดยตรง!
                </div>

                {/* Blocks list */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {extractedBlocks.map((block) => {
                    const isMapped = !!mappedFields[block.id];
                    const mappedFieldName = mappedFields[block.id];

                    return (
                      <div 
                        key={block.id}
                        className={`bg-white border rounded-xl p-4 shadow-xs transition-all ${
                          isMapped ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {block.title}
                          </span>
                          {isMapped && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                              <Check className="w-3 h-3" /> Mapped to {mappedFieldName}
                            </span>
                          )}
                        </div>

                        {/* Raw text */}
                        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-150 rounded-lg p-2.5 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed mb-3">
                          {block.content}
                        </div>

                        {/* Map select Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-bold uppercase">เชื่อมโยงกับฟิลด์:</span>
                          <select
                            value={mappedFields[block.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                handleMapField(block.id, val);
                              }
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">-- เลือกฟิลด์เพื่อจับคู่ --</option>
                            <option value="title">📌 ชื่อหัวเรื่อง (Title)</option>
                            <option value="problem">🔍 ปัญหาความต้องการ (Problem)</option>
                            <option value="context">📋 บริบทของระบบ (Context)</option>
                            <option value="solution">✔️ วิธีการแก้ไขปัญหา (Solution)</option>
                            <option value="evidence">📊 หลักฐาน/เอกสารอ้างอิง (Evidence)</option>
                            <option value="tags">🏷️ แท็ก (Tags)</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Column (RIGHT) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  ฟอร์มจัดทำข้อมูล (Mapped Knowledge Form)
                </h2>
                {uploadedFileName && (
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                    ผูกข้อมูลจาก: {uploadedFileName}
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                    <span>ชื่อหัวเรื่อง (Title)</span>
                    {formData.title && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <input 
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="เช่น การใช้งาน useEffect ใน React 19 สำหรับ Group State"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                      <span>ปัญหาความต้องการ (Problem)</span>
                      {formData.problem && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                    </label>
                    <p className="text-xs text-slate-500 mb-2">ระบุเป้าหมายหรือความขัดข้องที่เกิดขึ้นจริง</p>
                    <textarea 
                      required
                      name="problem"
                      value={formData.problem}
                      onChange={handleChange}
                      rows={4}
                      placeholder="เช่น บราว์เซอร์เกิดลูปไม่รู้จบเนื่องจากตัวแปร Dependency Array ไม่คงที่..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm text-slate-700 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                      <span>บริบทข้อกำหนด (Context)</span>
                      {formData.context && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                    </label>
                    <p className="text-xs text-slate-500 mb-2">ข้อมูลภูมิหลัง สภาพแวดล้อมระบบ ข้อจำกัด</p>
                    <textarea 
                      required
                      name="context"
                      value={formData.context}
                      onChange={handleChange}
                      rows={4}
                      placeholder="เช่น สภาพแวดล้อมใช้งาน React 19 Client-component บนสถาปัตยกรรม Next.js v15..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm text-slate-700 leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                    <span>วิธีการแก้ไขปัญหา (Solution)</span>
                    {formData.solution && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <p className="text-xs text-slate-500 mb-2">แนวทางการเขียนโค้ด การทำลายลูป การใช้ hook อย่างถูกต้อง</p>
                  <textarea 
                    required
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    rows={6}
                    placeholder="ระบุข้อเท็จจริง คำสั่งโค้ด หรือคำอธิบายมาร์กดาวน์..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                    <span>หลักฐานความน่าเชื่อถือ (Evidence)</span>
                    {formData.evidence && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <p className="text-xs text-slate-500 mb-2">ทำไมข้อมูลชุดนี้จึงน่าเชื่อถือ (การทดสอบ, แหล่งวิจัยอ้างอิง, ข้อมูลสถิติ)</p>
                  <textarea 
                    required
                    name="evidence"
                    value={formData.evidence}
                    onChange={handleChange}
                    rows={2}
                    placeholder="เช่น ผลลัพธ์จากการ Benchmark บน Node.js v22 แสดงประสิทธิภาพการตอบสนองเร็วขึ้น 40%..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs sm:text-sm text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                    <span>ป้ายกำกับ (Tags)</span>
                    {formData.tags && <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> มีข้อมูลแล้ว</span>}
                  </label>
                  <input 
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น React, Frontend, Architecture, Hook"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4 shrink-0" />
                    คะแนนความน่าเชื่อถือจะคำนวณเบื้องต้นจากการแมปข้อมูลที่กรอกและประเภทบัญชี
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'สร้างและเผยแพร่ข้อมูล'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>
      )}

      {entryMode === 'manual' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center gap-1.5 text-xs font-bold text-amber-700 border-amber-200/50">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            ข้อกำหนดคุณภาพ: การระบุปัญหาที่ชัดเจนร่วมกับหลักฐานความถูกต้องเป็นฟิลด์บังคับ
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">ชื่อหัวเรื่อง (Title)</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น การป้องกันการรั่วไหลของความจำด้วย AbortController ใน React"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">ปัญหาความต้องการ (Problem)</label>
                <p className="text-xs text-slate-500 mb-2">อะไรคือปัญหาความขัดข้องหลัก?</p>
                <textarea 
                  required
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  rows={3}
                  placeholder="อธิบายเหตุการณ์หรือข้อผิดพลาด..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">บริบทความเชื่อมโยง (Context)</label>
                <p className="text-xs text-slate-500 mb-2">บริบท สภาพแวดล้อม หรือข้อจำกัดที่เกี่ยวข้อง</p>
                <textarea 
                  required
                  name="context"
                  value={formData.context}
                  onChange={handleChange}
                  rows={3}
                  placeholder="อธิบายเบื้องหลังการทำงาน..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">วิธีการแก้ไขปัญหา (Solution)</label>
              <p className="text-xs text-slate-500 mb-2">วิธีการเขียนโปรแกรมแก้ไข (รองรับคำสั่งรูปแบบมาร์กดาวน์)</p>
              <textarea 
                required
                name="solution"
                value={formData.solution}
                onChange={handleChange}
                rows={5}
                placeholder="ระบุแนวทางและบล็อกโค้ดตัวอย่าง..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">หลักฐานอ้างอิงความน่าเชื่อถือ (Evidence)</label>
              <p className="text-xs text-slate-500 mb-2">ระบุหลักการพิสูจน์ความเสถียร ผลการทดลองเพื่อส่งคะแนนประมวลผล</p>
              <textarea 
                required
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                rows={2}
                placeholder="เช่น การเรียกใช้ API ถูกยกเลิกโดยสมบูรณ์เมื่อถอดหน้าจอออก และลดการประมวลผล CPU ลง 15%..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">ป้ายกำกับ (Tags)</label>
              <input 
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น React, Memory, AbortController"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 shrink-0" />
                จะประมวลผลคะแนน Trust Score เมื่อสร้างผลลัพธ์ข้อมูลเสร็จสิ้น
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'สร้างและเผยแพร่ข้อมูล'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
