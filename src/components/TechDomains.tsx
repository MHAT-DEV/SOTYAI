import { useState, useEffect } from 'react';
import { KnowledgeObject, Identity } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Cpu, 
  Code, 
  Search, 
  Plus, 
  Layers, 
  TrendingUp, 
  Settings, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  HardDrive, 
  Terminal, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  Eye,
  Bookmark,
  Share2,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TechDomainsProps {
  identity: Identity | null;
  onSelectKnowledgeObject?: (id: string) => void;
}

interface LocalTranslation {
  alertNoIdentity: string;
  alertIncomplete: string;
  alertError: string;
  registerNode: (domain: string) => string;
  titleLabel: string;
  titlePlaceholderHW: string;
  titlePlaceholderSW: string;
  problemLabel: string;
  problemPlaceholder: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  catLabel: string;
  catPlaceholder: string;
  contextLabel: string;
  contextPlaceholderHW: string;
  contextPlaceholderSW: string;
  solutionLabel: string;
  solutionPlaceholder: string;
  evidenceLabel: string;
  evidencePlaceholder: string;
  cancel: string;
  save: string;
}

const localTranslations: Record<string, LocalTranslation> = {
  en: {
    alertNoIdentity: 'Please select an Identity before creating knowledge',
    alertIncomplete: 'Please fill in the title and solution',
    alertError: 'An error occurred while registering the knowledge object',
    registerNode: (domain) => `Register New Object in: ${domain} Node`,
    titleLabel: 'Knowledge Title *',
    titlePlaceholderHW: 'e.g. Design Low-Power Sleep on ESP32-S3',
    titlePlaceholderSW: 'e.g. Improve Middleware JWT Verification in REST API',
    problemLabel: 'Problem Statement *',
    problemPlaceholder: 'Describe the problem you are solving...',
    tagsLabel: 'Tags (comma separated)',
    tagsPlaceholder: 'e.g. ESP32, Sleep, LowPower',
    catLabel: 'Categories',
    catPlaceholder: 'e.g. Hardware Engineering',
    contextLabel: 'Context & Requirements *',
    contextPlaceholderHW: 'e.g. Voltage 3.3V, LiPo 1200mAh source...',
    contextPlaceholderSW: 'e.g. Node.js v18, Docker container environment, Redis cache...',
    solutionLabel: 'Solution Description *',
    solutionPlaceholder: 'Write the step-by-step wiring or correct and secure code structure...',
    evidenceLabel: 'Evidence & Verification',
    evidencePlaceholder: 'e.g. Results from Oscilloscope testing, or benchmark results...',
    cancel: 'Cancel',
    save: 'Save Knowledge',
  },
  th: {
    alertNoIdentity: 'กรุณาเลือกประวัติประจำตัว (Identity) ก่อนสร้างบทความความรู้',
    alertIncomplete: 'กรุณากรอกชื่อเรื่องและวิธีแก้ไขปัญหาให้เรียบร้อย',
    alertError: 'เกิดข้อผิดพลาดในการลงทะเบียนวัตถุความรู้',
    registerNode: (domain) => `ลงทะเบียนวัตถุความรู้ใหม่ในระบบแยกส่วน: ${domain} Node`,
    titleLabel: 'ชื่อหัวข้อความรู้ (Title) *',
    titlePlaceholderHW: 'เช่น ออกแบบ Low-Power Sleep on ESP32-S3',
    titlePlaceholderSW: 'เช่น ปรับปรุง Middleware JWT Verification ใน REST API',
    problemLabel: 'ปัญหาที่เกิดขึ้น (Problem Statement) *',
    problemPlaceholder: 'อธิบายปัญหาที่ต้องการแก้ไข...',
    tagsLabel: 'แท็ก (Tags) - คั่นด้วยจุลภาค',
    tagsPlaceholder: 'เช่น ESP32, Sleep, LowPower',
    catLabel: 'หมวดหมู่ (Categories)',
    catPlaceholder: 'เช่น Hardware Engineering',
    contextLabel: 'บริบทและข้อจำกัด (Context & Requirements) *',
    contextPlaceholderHW: 'เช่น แรงดันไฟ 3.3V, แหล่งจ่ายจากแบต LiPo 1200mAh...',
    contextPlaceholderSW: 'เช่น Node.js v18, สภาพแวดล้อม Docker container, Redis cache...',
    solutionLabel: 'วิธีการแก้ไขที่สมบูรณ์แบบ (Solution Description) *',
    solutionPlaceholder: 'เขียนอธิบายขั้นตอนการต่อวงจร หรือโครงสร้างโค้ดที่ถูกต้องและปลอดภัย...',
    evidenceLabel: 'หลักฐานเชิงประจักษ์และการยืนยัน (Evidence & Verification)',
    evidencePlaceholder: 'เช่น ผลลัพธ์จากการทดสอบผ่านเครื่องออสซิลโลสโคป หรือผล benchmark การประมวลผล...',
    cancel: 'ยกเลิก',
    save: 'บันทึกองค์ความรู้',
  },
  ja: {
    alertNoIdentity: '知識を作成する前にアイデンティティを選択してください',
    alertIncomplete: 'タイトルと解決策を入力してください',
    alertError: '知識オブジェクトの登録中にエラーが発生しました',
    registerNode: (domain) => `分離システムに新しいオブジェクトを登録: ${domain} Node`,
    titleLabel: '知識タイトル *',
    titlePlaceholderHW: '例: ESP32-S3での低電力スリープの設計',
    titlePlaceholderSW: '例: REST APIでのミドルウェアJWT検証の改善',
    problemLabel: '問題の声明 (Problem Statement) *',
    problemPlaceholder: '解決したい問題を説明してください...',
    tagsLabel: 'タグ (カンマ区切り)',
    tagsPlaceholder: '例: ESP32, Sleep, LowPower',
    catLabel: 'カテゴリー',
    catPlaceholder: '例: Hardware Engineering',
    contextLabel: 'コンテキストと要件 *',
    contextPlaceholderHW: '例: 電圧3.3V、LiPo 1200mAh電源...',
    contextPlaceholderSW: '例: Node.js v18, Docker環境, Redisキャッシュ...',
    solutionLabel: '完全な解決策 (Solution Description) *',
    solutionPlaceholder: '配線の手順、または安全で正しいコード構造を記述してください...',
    evidenceLabel: '証拠と検証 (Evidence & Verification)',
    evidencePlaceholder: '例: オシロスコープでのテスト結果、またはベンチマーク結果...',
    cancel: 'キャンセル',
    save: '知識を保存',
  },
  zh: {
    alertNoIdentity: '请在创建知识之前选择一个身份',
    alertIncomplete: '请填写标题和解决方案',
    alertError: '注册知识对象时发生错误',
    registerNode: (domain) => `在隔离系统中注册新对象：${domain} 节点`,
    titleLabel: '知识标题 *',
    titlePlaceholderHW: '例如：在 ESP32-S3 上设计低功耗睡眠',
    titlePlaceholderSW: '例如：改进 REST API 中的中间件 JWT 验证',
    problemLabel: '问题陈述 *',
    problemPlaceholder: '描述您正在解决的问题...',
    tagsLabel: '标签 (逗号分隔)',
    tagsPlaceholder: '例如：ESP32, Sleep, LowPower',
    catLabel: '分类',
    catPlaceholder: '例如：硬件工程',
    contextLabel: '上下文和需求 *',
    contextPlaceholderHW: '例如：电压 3.3V，LiPo 1200mAh 电源...',
    contextPlaceholderSW: '例如：Node.js v18，Docker 容器环境，Redis 缓存...',
    solutionLabel: '解决方案描述 *',
    solutionPlaceholder: '写下逐步的接线过程或正确且安全的代码结构...',
    evidenceLabel: '证据和验证',
    evidencePlaceholder: '例如：示波器测试的结果，或基准测试结果...',
    cancel: '取消',
    save: '保存知识',
  },
  ko: {
    alertNoIdentity: '지식을 생성하기 전에 신원을 선택하세요',
    alertIncomplete: '제목과 해결책을 입력하세요',
    alertError: '지식 객체를 등록하는 동안 오류가 발생했습니다',
    registerNode: (domain) => `격리된 시스템에 새 객체 등록: ${domain} 노드`,
    titleLabel: '지식 제목 *',
    titlePlaceholderHW: '예: ESP32-S3에서 저전력 슬립 설계',
    titlePlaceholderSW: '예: REST API에서 미들웨어 JWT 검증 개선',
    problemLabel: '문제 설명 *',
    problemPlaceholder: '해결 중인 문제를 설명하세요...',
    tagsLabel: '태그 (쉼표로 구분)',
    tagsPlaceholder: '예: ESP32, Sleep, LowPower',
    catLabel: '카테고리',
    catPlaceholder: '예: 하드웨어 엔지니어링',
    contextLabel: '컨텍스트 및 요구 사항 *',
    contextPlaceholderHW: '예: 전압 3.3V, LiPo 1200mAh 전원...',
    contextPlaceholderSW: '예: Node.js v18, Docker 환경, Redis 캐시...',
    solutionLabel: '해결책 설명 *',
    solutionPlaceholder: '단계별 배선 또는 정확하고 안전한 코드 구조를 작성하세요...',
    evidenceLabel: '증거 및 검증',
    evidencePlaceholder: '예: 오실로스코프 테스트 결과 또는 벤치마크 결과...',
    cancel: '취소',
    save: '지식 저장',
  },
  de: {
    alertNoIdentity: 'Bitte wählen Sie eine Identität aus, bevor Sie Wissen erstellen',
    alertIncomplete: 'Bitte füllen Sie den Titel und die Lösung aus',
    alertError: 'Bei der Registrierung des Wissensobjekts ist ein Fehler aufgetreten',
    registerNode: (domain) => `Neues Objekt registrieren in: ${domain} Knoten`,
    titleLabel: 'Wissenstitel *',
    titlePlaceholderHW: 'z.B. Design Low-Power Sleep auf ESP32-S3',
    titlePlaceholderSW: 'z.B. Middleware JWT-Verifizierung in REST-API verbessern',
    problemLabel: 'Problemstellung *',
    problemPlaceholder: 'Beschreiben Sie das Problem, das Sie lösen...',
    tagsLabel: 'Tags (durch Komma getrennt)',
    tagsPlaceholder: 'z.B. ESP32, Sleep, LowPower',
    catLabel: 'Kategorien',
    catPlaceholder: 'z.B. Hardware Engineering',
    contextLabel: 'Kontext & Anforderungen *',
    contextPlaceholderHW: 'z.B. Spannung 3,3V, LiPo 1200mAh Quelle...',
    contextPlaceholderSW: 'z.B. Node.js v18, Docker-Umgebung, Redis-Cache...',
    solutionLabel: 'Lösungsbeschreibung *',
    solutionPlaceholder: 'Schreiben Sie die schrittweise Verkabelung oder die korrekte Codestruktur...',
    evidenceLabel: 'Beweise & Verifizierung',
    evidencePlaceholder: 'z.B. Ergebnisse von Oszilloskop-Tests oder Benchmarks...',
    cancel: 'Abbrechen',
    save: 'Wissen speichern',
  },
  fr: {
    alertNoIdentity: 'Veuillez sélectionner une identité avant de créer un objet de connaissance',
    alertIncomplete: 'Veuillez remplir le titre et la solution',
    alertError: 'Une erreur s\'est produite lors de l\'enregistrement de l\'objet de connaissance',
    registerNode: (domain) => `Enregistrer un nouvel objet dans : Nœud ${domain}`,
    titleLabel: 'Titre de la connaissance *',
    titlePlaceholderHW: 'ex: Concevoir le Low-Power Sleep sur ESP32-S3',
    titlePlaceholderSW: 'ex: Améliorer la vérification JWT Middleware dans l\'API REST',
    problemLabel: 'Énoncé du problème *',
    problemPlaceholder: 'Décrivez le problème que vous résolvez...',
    tagsLabel: 'Tags (séparés par des virgules)',
    tagsPlaceholder: 'ex: ESP32, Sleep, LowPower',
    catLabel: 'Catégories',
    catPlaceholder: 'ex: Ingénierie Matérielle',
    contextLabel: 'Contexte et Exigences *',
    contextPlaceholderHW: 'ex: Tension 3.3V, source LiPo 1200mAh...',
    contextPlaceholderSW: 'ex: Node.js v18, environnement Docker, cache Redis...',
    solutionLabel: 'Description de la Solution *',
    solutionPlaceholder: 'Décrivez le câblage étape par étape ou la structure de code correcte...',
    evidenceLabel: 'Preuves et Vérification',
    evidencePlaceholder: 'ex: Résultats de tests d\'oscilloscope, ou résultats de benchmarks...',
    cancel: 'Annuler',
    save: 'Enregistrer la Connaissance',
  },
  es: {
    alertNoIdentity: 'Seleccione una Identidad antes de crear conocimiento',
    alertIncomplete: 'Complete el título y la solución',
    alertError: 'Se produjo un error al registrar el objeto de conocimiento',
    registerNode: (domain) => `Registrar Nuevo Objeto en: Nodo ${domain}`,
    titleLabel: 'Título del Conocimiento *',
    titlePlaceholderHW: 'ej: Diseñar Low-Power Sleep en ESP32-S3',
    titlePlaceholderSW: 'ej: Mejorar la verificación JWT en la API REST',
    problemLabel: 'Declaración del Problema *',
    problemPlaceholder: 'Describa el problema que está resolviendo...',
    tagsLabel: 'Etiquetas (separadas por comas)',
    tagsPlaceholder: 'ej: ESP32, Sleep, LowPower',
    catLabel: 'Categorías',
    catPlaceholder: 'ej: Ingeniería de Hardware',
    contextLabel: 'Contexto y Requisitos *',
    contextPlaceholderHW: 'ej: Voltaje 3.3V, fuente LiPo 1200mAh...',
    contextPlaceholderSW: 'ej: Node.js v18, entorno Docker, caché Redis...',
    solutionLabel: 'Descripción de la Solución *',
    solutionPlaceholder: 'Escriba el cableado paso a paso o la estructura de código correcta...',
    evidenceLabel: 'Evidencia y Verificación',
    evidencePlaceholder: 'ej: Resultados de pruebas de osciloscopio o pruebas comparativas...',
    cancel: 'Cancelar',
    save: 'Guardar Conocimiento',
  },
  ru: {
    alertNoIdentity: 'Пожалуйста, выберите профиль перед созданием знаний',
    alertIncomplete: 'Пожалуйста, заполните заголовок и решение',
    alertError: 'Произошла ошибка при регистрации объекта знаний',
    registerNode: (domain) => `Регистрация нового объекта: Узел ${domain}`,
    titleLabel: 'Заголовок *',
    titlePlaceholderHW: 'напр. Проектирование Low-Power Sleep на ESP32-S3',
    titlePlaceholderSW: 'напр. Улучшение JWT-верификации в REST API',
    problemLabel: 'Описание проблемы *',
    problemPlaceholder: 'Опишите проблему, которую вы решаете...',
    tagsLabel: 'Теги (через запятую)',
    tagsPlaceholder: 'напр. ESP32, Sleep, LowPower',
    catLabel: 'Категории',
    catPlaceholder: 'напр. Разработка оборудования',
    contextLabel: 'Контекст и требования *',
    contextPlaceholderHW: 'напр. Напряжение 3.3В, источник LiPo 1200мАч...',
    contextPlaceholderSW: 'напр. Node.js v18, среда Docker, кэш Redis...',
    solutionLabel: 'Описание решения *',
    solutionPlaceholder: 'Опишите пошаговую проводку или структуру кода...',
    evidenceLabel: 'Доказательства и проверка',
    evidencePlaceholder: 'напр. Результаты проверки осциллографом или бенчмарки...',
    cancel: 'Отмена',
    save: 'Сохранить знания',
  },
  vi: {
    alertNoIdentity: 'Vui lòng chọn Danh tính trước khi tạo tri thức',
    alertIncomplete: 'Vui lòng điền tiêu đề và giải pháp',
    alertError: 'Đã xảy ra lỗi khi đăng ký đối tượng tri thức',
    registerNode: (domain) => `Đăng ký Đối tượng Mới trong: Node ${domain}`,
    titleLabel: 'Tiêu đề Tri thức *',
    titlePlaceholderHW: 'vd: Thiết kế Low-Power Sleep trên ESP32-S3',
    titlePlaceholderSW: 'vd: Cải thiện Xác thực JWT Middleware trong REST API',
    problemLabel: 'Mô tả Vấn đề *',
    problemPlaceholder: 'Mô tả vấn đề bạn đang giải quyết...',
    tagsLabel: 'Thẻ (phân cách bằng dấu phẩy)',
    tagsPlaceholder: 'vd: ESP32, Sleep, LowPower',
    catLabel: 'Danh mục',
    catPlaceholder: 'vd: Kỹ thuật Phần cứng',
    contextLabel: 'Ngữ cảnh và Yêu cầu *',
    contextPlaceholderHW: 'vd: Điện áp 3.3V, nguồn LiPo 1200mAh...',
    contextPlaceholderSW: 'vd: Node.js v18, môi trường Docker, Redis cache...',
    solutionLabel: 'Mô tả Giải pháp *',
    solutionPlaceholder: 'Viết từng bước đi dây điện hoặc cấu trúc mã chính xác...',
    evidenceLabel: 'Bằng chứng và Xác minh',
    evidencePlaceholder: 'vd: Kết quả từ thử nghiệm máy hiện sóng, hoặc điểm chuẩn...',
    cancel: 'Hủy bỏ',
    save: 'Lưu Tri thức',
  }
};

export default function TechDomains({ identity, onSelectKnowledgeObject }: TechDomainsProps) {
  const { t, language } = useLanguage();
  const tLocal = localTranslations[language] || localTranslations.en;
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'both' | 'hardware' | 'software'>('both');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDomain, setModalDomain] = useState<'Hardware' | 'Software'>('Hardware');
  const [newTitle, setNewTitle] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newTagsString, setNewTagsString] = useState('');
  const [newCategoryString, setNewCategoryString] = useState('');

  const fetchKnowledge = () => {
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => {
        setKnowledgeList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching domain knowledge:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleCreateKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      alert(tLocal.alertNoIdentity);
      return;
    }
    if (!newTitle.trim() || !newSolution.trim()) {
      alert(tLocal.alertIncomplete);
      return;
    }

    const tags = newTagsString.split(',').map(t => t.trim()).filter(Boolean);
    if (!tags.includes(modalDomain)) {
      tags.unshift(modalDomain);
    }

    const payload = {
      title: newTitle.trim(),
      problem: newProblem.trim(),
      context: newContext.trim(),
      requirements: newRequirements.trim(),
      solution: newSolution.trim(),
      evidence: newEvidence.trim(),
      authorId: identity.id,
      version: '1.0',
      language: 'English',
      tags,
      categories: newCategoryString.split(',').map(c => c.trim()).filter(Boolean),
      entities: [modalDomain],
      references: ['https://wikipedia.org']
    };

    fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create knowledge');
        return res.json();
      })
      .then(() => {
        setNewTitle('');
        setNewProblem('');
        setNewContext('');
        setNewRequirements('');
        setNewSolution('');
        setNewEvidence('');
        setNewTagsString('');
        setNewCategoryString('');
        setShowAddModal(false);
        fetchKnowledge();
      })
      .catch(err => {
        console.error('Error creating knowledge object:', err);
        alert(tLocal.alertError);
      });
  };

  // Helper helper to categorize objects based on tags or properties
  const hwObjects = knowledgeList.filter(k => 
    k.tags.some(tag => tag.toLowerCase() === 'hardware') || 
    k.categories.some(cat => cat.toLowerCase().includes('hardware') || cat.toLowerCase().includes('electronic'))
  );

  const swObjects = knowledgeList.filter(k => 
    k.tags.some(tag => tag.toLowerCase() === 'software') || 
    k.categories.some(cat => cat.toLowerCase().includes('software') || cat.toLowerCase().includes('backend') || cat.toLowerCase().includes('web') || cat.toLowerCase().includes('development'))
  );

  // Filter with query
  const matchesQuery = (k: KnowledgeObject) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return k.title.toLowerCase().includes(q) || 
           k.problem.toLowerCase().includes(q) || 
           k.tags.some(t => t.toLowerCase().includes(q)) ||
           k.categories.some(c => c.toLowerCase().includes(q));
  };

  const filteredHw = hwObjects.filter(matchesQuery);
  const filteredSw = swObjects.filter(matchesQuery);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-amber-600 animate-spin"></div>
        <p className="text-sm font-medium">Sorting Hardware and Software streams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/25 to-blue-950/25 rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-500">
            <Layers className="w-3.5 h-3.5" /> Domain Segregation Engine
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            {t('domains.title')}
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {t('domains.desc')}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setModalDomain('Hardware');
              setNewTagsString('Hardware, Electronics');
              setNewCategoryString('Hardware Engineering');
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> {t('domains.btnHwAdd')}
          </button>
          
          <button
            onClick={() => {
              setModalDomain('Software');
              setNewTagsString('Software, Backend');
              setNewCategoryString('Software Architecture');
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> {t('domains.btnSwAdd')}
          </button>
        </div>
      </div>

      {/* Domain Navigation & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        {/* Toggle tabs */}
        <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('both')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-extrabold rounded-md cursor-pointer transition-all ${
              activeTab === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('domains.btnBoth')}
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-extrabold rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'hardware' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> {t('domains.btnHw')}
          </button>
          <button
            onClick={() => setActiveTab('software')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-extrabold rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'software' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> {t('domains.btnSw')}
          </button>
        </div>

        {/* Global Search inside Segregated domain */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('domains.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Bento Grid layout representing segregated labs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Hardware Lab Panel */}
        {(activeTab === 'both' || activeTab === 'hardware') && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 rounded-xl text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                  <Cpu className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">{t('domains.hwTitle')}</h2>
                  <p className="text-[10px] text-amber-100/80">{t('domains.hwDesc')} ({hwObjects.length} Nodes)</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-amber-800/40 border border-white/20 px-2 py-0.5 rounded">
                HW-LAB
              </span>
            </div>

            {/* Hardware list */}
            <div className="space-y-4">
              {filteredHw.length > 0 ? (
                filteredHw.map(k => (
                  <div 
                    key={k.id}
                    className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-r-xl p-5 hover:border-slate-350 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {k.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">ID: {k.id}</p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        🛡️ Trust Score: {k.trustScore.overall}%
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/80 p-3 rounded-lg border border-slate-150 text-xs">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Physical Problem Statement:</p>
                      <p className="text-slate-800 font-medium leading-relaxed">{k.problem}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Constraints / Requirements:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.requirements}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Circuit/Firmware Solution:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.solution}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                      {k.tags.map(t => (
                        <span key={t} className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Direct Navigate to detail link */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Reads: {k.consumptionMetrics.humanReads}</span>
                        <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Pinouts: {k.consumptionMetrics.aiApiRequests}</span>
                      </div>
                      
                      {onSelectKnowledgeObject ? (
                        <button
                          onClick={() => onSelectKnowledgeObject(k.id)}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Open Lab Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Link
                          to={`/knowledge/${k.id}`}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5"
                        >
                          <span>Open Lab Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-slate-150 rounded-xl">
                  <p className="text-slate-400 font-bold text-xs">No hardware laboratory entries found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Software Lab Panel */}
        {(activeTab === 'both' || activeTab === 'software') && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                  <Code className="w-5 h-5 text-blue-100" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">{t('domains.swTitle')}</h2>
                  <p className="text-[10px] text-blue-100/80">{t('domains.swDesc')} ({swObjects.length} Nodes)</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-blue-800/40 border border-white/20 px-2 py-0.5 rounded">
                SW-LAB
              </span>
            </div>

            {/* Software list */}
            <div className="space-y-4">
              {filteredSw.length > 0 ? (
                filteredSw.map(k => (
                  <div 
                    key={k.id}
                    className="bg-white border-l-4 border-l-blue-500 border border-slate-200 rounded-r-xl p-5 hover:border-slate-350 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {k.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">ID: {k.id}</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        🛡️ Trust Score: {k.trustScore.overall}%
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/80 p-3 rounded-lg border border-slate-150 text-xs">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Architectural Goal / Problem:</p>
                      <p className="text-slate-800 font-medium leading-relaxed">{k.problem}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Reference Tools:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.requirements}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Code Solution:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.solution}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                      {k.tags.map(t => (
                        <span key={t} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Direct Navigate to detail link */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Reads: {k.consumptionMetrics.humanReads}</span>
                        <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> API Syncs: {k.consumptionMetrics.aiReads}</span>
                      </div>
                      
                      {onSelectKnowledgeObject ? (
                        <button
                          onClick={() => onSelectKnowledgeObject(k.id)}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Inspect Architecture</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Link
                          to={`/knowledge/${k.id}`}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
                        >
                          <span>Inspect Architecture</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-slate-150 rounded-xl">
                  <p className="text-slate-400 font-bold text-xs">No software engineering laboratory entries found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add node modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className={`px-6 py-4 border-b border-slate-150 flex items-center justify-between text-white ${
              modalDomain === 'Hardware' ? 'bg-amber-700' : 'bg-blue-700'
            }`}>
              <h2 className="text-sm font-bold flex items-center gap-2">
                {modalDomain === 'Hardware' ? <Cpu className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                <span>{tLocal.registerNode(modalDomain)}</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-slate-200 font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKnowledge} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {tLocal.titleLabel}
                </label>
                <input
                  type="text"
                  placeholder={modalDomain === 'Hardware' ? tLocal.titlePlaceholderHW : tLocal.titlePlaceholderSW}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {tLocal.problemLabel}
                </label>
                <textarea
                  placeholder={tLocal.problemPlaceholder}
                  rows={2}
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {tLocal.tagsLabel}
                  </label>
                  <input
                    type="text"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    placeholder={tLocal.tagsPlaceholder}
                    className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {tLocal.catLabel}
                  </label>
                  <input
                    type="text"
                    value={newCategoryString}
                    onChange={(e) => setNewCategoryString(e.target.value)}
                    placeholder={tLocal.catPlaceholder}
                    className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {tLocal.contextLabel}
                </label>
                <textarea
                  placeholder={modalDomain === 'Hardware' ? tLocal.contextPlaceholderHW : tLocal.contextPlaceholderSW}
                  rows={2}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {tLocal.solutionLabel}
                </label>
                <textarea
                  placeholder={tLocal.solutionPlaceholder}
                  rows={3}
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {tLocal.evidenceLabel}
                </label>
                <textarea
                  placeholder={tLocal.evidencePlaceholder}
                  rows={2}
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="border-t border-slate-150 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {tLocal.cancel}
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    modalDomain === 'Hardware' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {tLocal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
