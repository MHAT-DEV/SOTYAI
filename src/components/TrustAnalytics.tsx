import { useState, useEffect } from 'react';
import { Shield, TrendingUp, Activity, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const localTranslations: Record<string, Record<string, string>> = {
  th: {
    loading: 'กำลังโหลดข้อมูลการวิเคราะห์ความน่าเชื่อถือ...',
    title: 'การวิเคราะห์ระบบความเชื่อมั่น (Trust Engine Analytics)',
    subtitle: 'ข้อมูลเชิงลึกทั่วทั้งแพลตฟอร์มเกี่ยวกับการตรวจสอบตัวตนและความถูกต้องของความรู้',
    last6Months: '6 เดือนที่ผ่านมา',
    last30Days: '30 วันที่ผ่านมา',
    thisYear: 'ปีนี้',
    globalTrust: 'ความเชื่อถือเฉลี่ยทั่วโลก',
    fromLastMonth: 'จากเดือนที่แล้ว',
    networkAccuracy: 'ความแม่นยำของเครือข่าย',
    activeVerifications: 'การตรวจสอบที่กำลังทำงาน',
    systemConfidence: 'ความมั่นใจของระบบ',
    basedOnConsensus: 'อิงตามอัลกอริทึมฉันทามติ',
    trustTimeline: 'เส้นเวลาวิวัฒนาการความเชื่อมั่น',
    trustVector: 'เวกเตอร์การกระจายความเชื่อมั่น',
    engineMechanics: 'กลไกการทำงานของเอนจิน',
    engineDesc: 'SOTYAI Trust Engine ใช้อัลกอริทึมฉันทามติหลายมิติที่รวมการรีวิวของมนุษย์ การตรวจสอบจากเอเจนต์ AI บันทึกความถูกต้องในอดีต และการติดตามแหล่งที่มาของการเข้ารหัส มุมมองการวิเคราะห์ด้านบนแสดงถึงสุขภาพโดยรวมของระบบนิเวศความจริงในเครือข่ายความรู้',
    overallTrust: 'ความเชื่อมั่นโดยรวม',
    contentAccuracy: 'ความถูกต้องของเนื้อหา'
  },
  en: {
    loading: 'Loading Trust Analytics...',
    title: 'Trust Engine Analytics',
    subtitle: 'Platform-wide insights into identity verification and knowledge accuracy.',
    last6Months: 'Last 6 Months',
    last30Days: 'Last 30 Days',
    thisYear: 'This Year',
    globalTrust: 'Global Trust Average',
    fromLastMonth: 'from last month',
    networkAccuracy: 'Network Accuracy',
    activeVerifications: 'Active Verifications',
    systemConfidence: 'System Confidence',
    basedOnConsensus: 'Based on consensus algorithms',
    trustTimeline: 'Trust Evolution Timeline',
    trustVector: 'Trust Distribution Vector',
    engineMechanics: 'Engine Mechanics',
    engineDesc: 'The SOTYAI Trust Engine uses a multi-dimensional consensus algorithm combining human reviews, AI agent verification passes, historical accuracy records, and cryptographic provenance tracing. The Analytics view above represents the aggregate health of the knowledge network\'s truth ecosystem over time.',
    overallTrust: 'Overall Trust',
    contentAccuracy: 'Content Accuracy'
  },
  ja: {
    loading: '信頼性分析を読み込み中...',
    title: '信頼エンジン分析',
    subtitle: '身元確認と知識の正確性に関するプラットフォーム全体のインサイト。',
    last6Months: '過去6ヶ月',
    last30Days: '過去30日間',
    thisYear: '今年',
    globalTrust: 'グローバル信頼平均',
    fromLastMonth: '先月比',
    networkAccuracy: 'ネットワークの正確性',
    activeVerifications: 'アクティブな検証数',
    systemConfidence: 'システム信頼度',
    basedOnConsensus: '合意アルゴリズムに基づく',
    trustTimeline: '信頼性の進化タイムライン',
    trustVector: '信頼性分布ベクトル',
    engineMechanics: 'エンジンの仕組み',
    engineDesc: 'SOTYAI 信頼エンジンは、人間のレビュー、AIエージェントの検証パス、過去の正確性の記録、および暗号化による出所追跡を組み合わせた多次元合意アルゴリズムを使用しています。上記の分析ビューは、ナレッジネットワークの真実エコシステムの全体的な健全性を表しています。',
    overallTrust: '総合信頼性',
    contentAccuracy: 'コンテンツの正確性'
  },
  zh: {
    loading: '正在加载信任度分析...',
    title: '信任引擎分析',
    subtitle: '关于身份验证和知识准确性的平台全局见解。',
    last6Months: '最近6个月',
    last30Days: '最近30天',
    thisYear: '今年',
    globalTrust: '全局平均信任度',
    fromLastMonth: '较上月',
    networkAccuracy: '网络准确率',
    activeVerifications: '活跃验证数',
    systemConfidence: '系统置信度',
    basedOnConsensus: '基于共识算法',
    trustTimeline: '信任度演变时间线',
    trustVector: '信任分布向量',
    engineMechanics: '引擎运作机制',
    engineDesc: 'SOTYAI 信任引擎使用多维共识算法，结合了人工评审、AI 代理验证通道、历史准确度记录和密码学来源追踪。上面的分析视图代表了知识网络真实生态系统随时间变化的整体健康状况。',
    overallTrust: '整体信任度',
    contentAccuracy: '内容准确度'
  },
  ko: {
    loading: '신뢰도 분석 불러오는 중...',
    title: '신뢰 엔진 분석',
    subtitle: '신원 검증 및 지식 정확성에 대한 플랫폼 전반의 인사이트를 제공합니다.',
    last6Months: '최근 6개월',
    last30Days: '최근 30일',
    thisYear: '올해',
    globalTrust: '글로벌 신뢰 평균',
    fromLastMonth: '지난달 대비',
    networkAccuracy: '네트워크 정확성',
    activeVerifications: '활성 검증 수',
    systemConfidence: '시스템 신뢰 수준',
    basedOnConsensus: '합의 알고리즘에 기반함',
    trustTimeline: '신뢰도 변화 타임라인',
    trustVector: '신뢰도 분포 벡터',
    engineMechanics: '엔진 메커니즘',
    engineDesc: 'SOTYAI 신뢰 엔진은 인간 검토, AI 에이전트 검증 통과, 역사적 정확성 기록 및 암호화 기원 추적을 결합한 다차원 합의 알고리즘을 사용합니다. 위의 분석 보기는 시간의 흐름에 따른 지식 네트워크의 진실 생태계 총합 건전성을 나타냅니다.',
    overallTrust: '종합 신뢰도',
    contentAccuracy: '콘텐츠 정확도'
  },
  de: {
    loading: 'Vertrauensanalyse wird geladen...',
    title: 'Vertrauens-Engine-Analyse',
    subtitle: 'Plattformweite Erkenntnisse über Identitätsprüfung und Wissensgenauigkeit.',
    last6Months: 'Letzte 6 Monate',
    last30Days: 'Letzte 30 Tage',
    thisYear: 'Dieses Jahr',
    globalTrust: 'Globaler Vertrauensdurchschnitt',
    fromLastMonth: 'vom Vormonat',
    networkAccuracy: 'Netzwerkgenauigkeit',
    activeVerifications: 'Aktive Verifizierungen',
    systemConfidence: 'Systemkonfidenz',
    basedOnConsensus: 'Basierend auf Konsensalgorithmen',
    trustTimeline: 'Entwicklung des Vertrauens',
    trustVector: 'Vertrauensverteilungsvektor',
    engineMechanics: 'Funktionsweise der Engine',
    engineDesc: 'Die SOTYAI Trust Engine verwendet einen mehrdimensionalen Konsensalgorithmus, der menschliche Überprüfungen, Verifizierungsdurchläufe von KI-Agenten, historische Genauigkeitsdaten und kryptografische Herkunftsverfolgung kombiniert. Die obige Analyseansicht zeigt die allgemeine Gesundheit des Wahrheitssystems des Wissensnetzwerks im Zeitverlauf.',
    overallTrust: 'Gesamtvertrauen',
    contentAccuracy: 'Inhaltsgenauigkeit'
  },
  fr: {
    loading: 'Chargement des analyses de confiance...',
    title: 'Analyses de l\'Engin de Confiance',
    subtitle: 'Aperçu global de la plateforme concernant la vérification des identités et l\'exactitude des connaissances.',
    last6Months: '6 Derniers Mois',
    last30Days: '30 Derniers Jours',
    thisYear: 'Cette Année',
    globalTrust: 'Moyenne de Confiance Globale',
    fromLastMonth: 'par rapport au mois dernier',
    networkAccuracy: 'Exactitude du Réseau',
    activeVerifications: 'Vérifications Actives',
    systemConfidence: 'Confiance Système',
    basedOnConsensus: 'Basé sur des algorithmes de consensus',
    trustTimeline: 'Évolution Temporelle de la Confiance',
    trustVector: 'Vecteur de Distribution de Confiance',
    engineMechanics: 'Mécanismes du Moteur',
    engineDesc: 'Le SOTYAI Trust Engine utilise un algorithme de consensus multidimensionnel combinant des évaluations humaines, des passes de vérification par agents IA, des historiques d\'exactitude et un traçage de provenance cryptographique. La vue analytique ci-dessus représente la santé globale de l\'écosystème de vérité du réseau de connaissances.',
    overallTrust: 'Confiance Globale',
    contentAccuracy: 'Exactitude du Contenu'
  },
  es: {
    loading: 'Cargando análisis de confianza...',
    title: 'Análisis del Motor de Confianza',
    subtitle: 'Información a nivel de plataforma sobre la verificación de identidad y la precisión del conocimiento.',
    last6Months: 'Últimos 6 meses',
    last30Days: 'Últimos 30 días',
    thisYear: 'Este año',
    globalTrust: 'Promedio de Confianza Global',
    fromLastMonth: 'desde el mes pasado',
    networkAccuracy: 'Precisión de la Red',
    activeVerifications: 'Verificaciones Activas',
    systemConfidence: 'Confianza del Sistema',
    basedOnConsensus: 'Basado en algoritmos de consenso',
    trustTimeline: 'Línea de Tiempo de Evolución de Confianza',
    trustVector: 'Vector de Distribución de Confianza',
    engineMechanics: 'Mecanismo del Motor',
    engineDesc: 'El SOTYAI Trust Engine utiliza un algoritmo de consenso multidimensional que combina revisiones humanas, pases de verificación de agentes de IA, registros de precisión histórica y seguimiento criptográfico de procedencia. La vista de análisis anterior representa la salud agregada del ecosistema de verdad de la red de conocimiento.',
    overallTrust: 'Confianza General',
    contentAccuracy: 'Precisión del Contenido'
  },
  ru: {
    loading: 'Загрузка аналитики доверия...',
    title: 'Аналитика системы доверия (Trust Engine)',
    subtitle: 'Платформенная статистика верификации учетных записей и точности знаний.',
    last6Months: 'За последние 6 месяцев',
    last30Days: 'За последние 30 дней',
    thisYear: 'В этом году',
    globalTrust: 'Средний глобальный уровень доверия',
    fromLastMonth: 'по сравнению с прошлым месяцем',
    networkAccuracy: 'Точность сети',
    activeVerifications: 'Активные верификации',
    systemConfidence: 'Уверенность системы',
    basedOnConsensus: 'На основе алгоритмов консенсуса',
    trustTimeline: 'История изменения доверия',
    trustVector: 'Вектор распределения доверия',
    engineMechanics: 'Механика работы ядра',
    engineDesc: 'Движок доверия SOTYAI использует многомерный алгоритм консенсуса, сочетающий человеческие обзоры, проверки агентами ИИ, исторические отчеты о точности и криптографическое отслеживание происхождения. Аналитическое представление выше отражает общее здоровье экосистемы истинности сети знаний с течением времени.',
    overallTrust: 'Общее доверие',
    contentAccuracy: 'Точность контента'
  },
  vi: {
    loading: 'Đang tải phân tích tin cậy...',
    title: 'Phân tích Công cụ Tin cậy',
    subtitle: 'Thông tin chuyên sâu trên toàn nền tảng về xác minh danh tính và độ chính xác của kiến thức.',
    last6Months: '6 tháng qua',
    last30Days: '30 ngày qua',
    thisYear: 'Năm nay',
    globalTrust: 'Độ tin cậy trung bình toàn cầu',
    fromLastMonth: 'so với tháng trước',
    networkAccuracy: 'Độ chính xác của mạng',
    activeVerifications: 'Xác minh đang hoạt động',
    systemConfidence: 'Độ tin cậy của hệ thống',
    basedOnConsensus: 'Dựa trên thuật toán đồng thuận',
    trustTimeline: 'Dòng thời gian phát triển lòng tin',
    trustVector: 'Vectơ phân phối lòng tin',
    engineMechanics: 'Cơ chế hoạt động của công cụ',
    engineDesc: 'SOTYAI Trust Engine sử dụng thuật toán đồng thuận đa chiều kết hợp đánh giá của con người, các bước xác minh đại lý AI, hồ sơ chính xác lịch sử và truy vết nguồn gốc mật mã. Chế độ xem Phân tích ở trên thể hiện tình trạng sức khỏe tổng hợp của hệ sinh thái sự thật thuộc mạng lưới kiến thức theo thời gian.',
    overallTrust: 'Độ tin cậy tổng thể',
    contentAccuracy: 'Độ chính xác nội dung'
  }
};

export default function TrustAnalytics() {
  const { language } = useLanguage();
  const lt = localTranslations[language] || localTranslations['en'];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/trust')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return <div className="py-12 text-center">{lt.loading}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" /> {lt.title}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">{lt.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5">
            <option>{lt.last6Months}</option>
            <option>{lt.last30Days}</option>
            <option>{lt.thisYear}</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{lt.globalTrust}</p>
              <h3 className="text-3xl font-black text-slate-900">{data.kpis.globalTrust}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4" /> +{data.kpis.globalTrustChange}% {lt.fromLastMonth}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{lt.networkAccuracy}</p>
              <h3 className="text-3xl font-black text-slate-900">{data.kpis.networkAccuracy}%</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4" /> +{data.kpis.networkAccuracyChange}% {lt.fromLastMonth}
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{lt.activeVerifications}</p>
              <h3 className="text-3xl font-black text-slate-900">{(data.kpis.activeVerifications / 1000).toFixed(1)}k</h3>
            </div>
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4" /> +{data.kpis.activeVerificationsChange}% {lt.fromLastMonth}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{lt.systemConfidence}</p>
              <h3 className="text-3xl font-black text-slate-900">{data.kpis.systemConfidence}</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-500">
            {lt.basedOnConsensus}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{lt.trustTimeline}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.timeSeries}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[60, 100]} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="overall" name={lt.overallTrust} stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorOverall)" />
                <Area type="monotone" dataKey="accuracy" name={lt.contentAccuracy} stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{lt.trustVector}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name={lt.trustVector} dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <h3 className="text-lg font-bold mb-2">{lt.engineMechanics}</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">
          {lt.engineDesc}
        </p>
      </div>
    </div>
  );
}
