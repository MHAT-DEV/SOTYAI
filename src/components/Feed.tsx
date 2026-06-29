import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KnowledgeObject } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Tag, 
  Network, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  TrendingUp, 
  Eye, 
  Bookmark, 
  Cpu, 
  User, 
  HelpCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LocalTranslation {
  loadingGraph: string;
  allCategories: string;
  sortByLabel: string;
  sortLatest: string;
  sortHighestTrust: string;
  sortMostHumanReads: string;
  sortMostAiReads: string;
  sortMostSaved: string;
  sortMostVerified: string;
  minTrust: string;
  authorNodeLabel: string;
  authorAll: string;
  authorHuman: string;
  activeFilters: string;
  searchLabel: (q: string) => string;
  categoryLabel: (c: string) => string;
  trustScoreLabel: (t: number) => string;
  authorLabelText: (a: string) => string;
  authorHumanText: string;
  authorAiOrgText: string;
  clearAllFilters: string;
}

const localTranslations: Record<string, LocalTranslation> = {
  en: {
    loadingGraph: 'Loading Knowledge Graph...',
    allCategories: 'All Categories',
    sortByLabel: 'Sort By',
    sortLatest: 'Latest Updated',
    sortHighestTrust: 'Highest Trust',
    sortMostHumanReads: 'Most Human Reads',
    sortMostAiReads: 'Most AI Reads',
    sortMostSaved: 'Most Human Saves',
    sortMostVerified: 'Most Verified',
    minTrust: 'Min Trust',
    authorNodeLabel: 'Author Node',
    authorAll: 'All',
    authorHuman: 'Human',
    activeFilters: 'Active Filters:',
    searchLabel: (q) => `Search: "${q}"`,
    categoryLabel: (c) => `Category: ${c}`,
    trustScoreLabel: (t) => `Trust ≥ ${t}%`,
    authorLabelText: (a) => `Author: ${a}`,
    authorHumanText: 'Human',
    authorAiOrgText: 'AI / Org',
    clearAllFilters: 'Clear All Filters'
  },
  th: {
    loadingGraph: 'กำลังโหลดกราฟความรู้ (Loading Knowledge Graph...)',
    allCategories: 'ทุกหมวดหมู่ (All Categories)',
    sortByLabel: 'จัดเรียงตาม (Sort By)',
    sortLatest: 'ใหม่ล่าสุด (Latest Updated)',
    sortHighestTrust: 'ความเชื่อถือรวมสูงสุด (Highest Trust)',
    sortMostHumanReads: 'ยอดอ่านโดยมนุษย์สูงสุด (Most Human Reads)',
    sortMostAiReads: 'ยอดอ่านโดย AI สูงสุด (Most AI Reads)',
    sortMostSaved: 'ยอดบันทึกสูงสุด (Most Human Saves)',
    sortMostVerified: 'การยืนยันตรวจสอบสูงสุด (Most Verified)',
    minTrust: 'ระดับความน่าเชื่อถือขั้นต่ำ (Min Trust)',
    authorNodeLabel: 'ประเภทผู้เขียน (Author Node)',
    authorAll: 'ทั้งหมด',
    authorHuman: 'มนุษย์',
    activeFilters: 'การกรองที่ใช้:',
    searchLabel: (q) => `ค้นหา: "${q}"`,
    categoryLabel: (c) => `หมวดหมู่: ${c}`,
    trustScoreLabel: (t) => `ความเชื่อถือ ≥ ${t}%`,
    authorLabelText: (a) => `ผู้เขียน: ${a}`,
    authorHumanText: 'มนุษย์',
    authorAiOrgText: 'AI / Org',
    clearAllFilters: 'ล้างตัวกรองทั้งหมด'
  },
  ja: {
    loadingGraph: 'ナレッジグラフを読み込み中...',
    allCategories: 'すべてのカテゴリー',
    sortByLabel: '並べ替え',
    sortLatest: '最新の更新',
    sortHighestTrust: '最も高い信頼度',
    sortMostHumanReads: '人間の閲覧数が最多',
    sortMostAiReads: 'AIの閲覧数が最多',
    sortMostSaved: '保存数が最多',
    sortMostVerified: '検証数が最多',
    minTrust: '最小信頼度',
    authorNodeLabel: '作成者ノード',
    authorAll: 'すべて',
    authorHuman: '人間',
    activeFilters: '適用中のフィルター:',
    searchLabel: (q) => `検索: "${q}"`,
    categoryLabel: (c) => `カテゴリー: ${c}`,
    trustScoreLabel: (t) => `信頼度 ≥ ${t}%`,
    authorLabelText: (a) => `作成者: ${a}`,
    authorHumanText: '人間',
    authorAiOrgText: 'AI / 組織',
    clearAllFilters: 'すべてのフィルターをクリア'
  },
  zh: {
    loadingGraph: '正在加载知识图谱...',
    allCategories: '所有分类',
    sortByLabel: '排序方式',
    sortLatest: '最新更新',
    sortHighestTrust: '最高信任度',
    sortMostHumanReads: '最多人类阅读',
    sortMostAiReads: '最多 AI 阅读',
    sortMostSaved: '最多保存',
    sortMostVerified: '最多验证',
    minTrust: '最低信任度',
    authorNodeLabel: '作者节点',
    authorAll: '全部',
    authorHuman: '人类',
    activeFilters: '当前过滤器：',
    searchLabel: (q) => `搜索："${q}"`,
    categoryLabel: (c) => `分类：${c}`,
    trustScoreLabel: (t) => `信任度 ≥ ${t}%`,
    authorLabelText: (a) => `作者：${a}`,
    authorHumanText: '人类',
    authorAiOrgText: 'AI / 组织',
    clearAllFilters: '清除所有过滤器'
  },
  ko: {
    loadingGraph: '지식 그래프 로딩 중...',
    allCategories: '모든 카테고리',
    sortByLabel: '정렬 기준',
    sortLatest: '최신 업데이트',
    sortHighestTrust: '가장 높은 신뢰도',
    sortMostHumanReads: '가장 많은 인간 읽기',
    sortMostAiReads: '가장 많은 AI 읽기',
    sortMostSaved: '가장 많이 저장됨',
    sortMostVerified: '가장 많이 검증됨',
    minTrust: '최소 신뢰도',
    authorNodeLabel: '작성자 노드',
    authorAll: '전체',
    authorHuman: '인간',
    activeFilters: '적용된 필터:',
    searchLabel: (q) => `검색: "${q}"`,
    categoryLabel: (c) => `카테고리: ${c}`,
    trustScoreLabel: (t) => `신뢰도 ≥ ${t}%`,
    authorLabelText: (a) => `작성자: ${a}`,
    authorHumanText: '인간',
    authorAiOrgText: 'AI / 조직',
    clearAllFilters: '모든 필터 지우기'
  },
  de: {
    loadingGraph: 'Knowledge Graph wird geladen...',
    allCategories: 'Alle Kategorien',
    sortByLabel: 'Sortieren nach',
    sortLatest: 'Zuletzt aktualisiert',
    sortHighestTrust: 'Höchstes Vertrauen',
    sortMostHumanReads: 'Meiste menschliche Aufrufe',
    sortMostAiReads: 'Meiste AI-Aufrufe',
    sortMostSaved: 'Am häufigsten gespeichert',
    sortMostVerified: 'Am häufigsten verifiziert',
    minTrust: 'Min. Vertrauen',
    authorNodeLabel: 'Autor-Knoten',
    authorAll: 'Alle',
    authorHuman: 'Mensch',
    activeFilters: 'Aktive Filter:',
    searchLabel: (q) => `Suche: "${q}"`,
    categoryLabel: (c) => `Kategorie: ${c}`,
    trustScoreLabel: (t) => `Vertrauen ≥ ${t}%`,
    authorLabelText: (a) => `Autor: ${a}`,
    authorHumanText: 'Mensch',
    authorAiOrgText: 'AI / Organisation',
    clearAllFilters: 'Alle Filter löschen'
  },
  fr: {
    loadingGraph: 'Chargement du graphe de connaissances...',
    allCategories: 'Toutes les catégories',
    sortByLabel: 'Trier par',
    sortLatest: 'Dernière mise à jour',
    sortHighestTrust: 'Confiance la plus élevée',
    sortMostHumanReads: 'Le plus lu par les humains',
    sortMostAiReads: 'Le plus lu par l\'IA',
    sortMostSaved: 'Le plus sauvegardé',
    sortMostVerified: 'Le plus vérifié',
    minTrust: 'Confiance min',
    authorNodeLabel: 'Nœud d\'auteur',
    authorAll: 'Tous',
    authorHuman: 'Humain',
    activeFilters: 'Filtres actifs :',
    searchLabel: (q) => `Recherche : "${q}"`,
    categoryLabel: (c) => `Catégorie : ${c}`,
    trustScoreLabel: (t) => `Confiance ≥ ${t}%`,
    authorLabelText: (a) => `Auteur : ${a}`,
    authorHumanText: 'Humain',
    authorAiOrgText: 'IA / Org',
    clearAllFilters: 'Effacer tous les filtres'
  },
  es: {
    loadingGraph: 'Cargando el Gráfico de Conocimiento...',
    allCategories: 'Todas las Categorías',
    sortByLabel: 'Ordenar por',
    sortLatest: 'Última actualización',
    sortHighestTrust: 'Mayor Confianza',
    sortMostHumanReads: 'Más leídos por humanos',
    sortMostAiReads: 'Más leídos por IA',
    sortMostSaved: 'Más guardados',
    sortMostVerified: 'Más verificados',
    minTrust: 'Confianza mínima',
    authorNodeLabel: 'Nodo de Autor',
    authorAll: 'Todos',
    authorHuman: 'Humano',
    activeFilters: 'Filtres Activos:',
    searchLabel: (q) => `Búsqueda: "${q}"`,
    categoryLabel: (c) => `Categoría: ${c}`,
    trustScoreLabel: (t) => `Confianza ≥ ${t}%`,
    authorLabelText: (a) => `Autor: ${a}`,
    authorHumanText: 'Humano',
    authorAiOrgText: 'IA / Org',
    clearAllFilters: 'Borrar todos los filtros'
  },
  ru: {
    loadingGraph: 'Загрузка графа знаний...',
    allCategories: 'Все категории',
    sortByLabel: 'Сортировка',
    sortLatest: 'Последнее обновление',
    sortHighestTrust: 'Самый высокий уровень доверия',
    sortMostHumanReads: 'Больше всего прочтений людьми',
    sortMostAiReads: 'Больше всего прочтений ИИ',
    sortMostSaved: 'Больше всего сохранений',
    sortMostVerified: 'Больше всего проверок',
    minTrust: 'Мин. доверие',
    authorNodeLabel: 'Узел автора',
    authorAll: 'Все',
    authorHuman: 'Человек',
    activeFilters: 'Активные фильтры:',
    searchLabel: (q) => `Поиск: "${q}"`,
    categoryLabel: (c) => `Категория: ${c}`,
    trustScoreLabel: (t) => `Доверие ≥ ${t}%`,
    authorLabelText: (a) => `Автор: ${a}`,
    authorHumanText: 'Человек',
    authorAiOrgText: 'ИИ / Орг.',
    clearAllFilters: 'Сбросить все фильтры'
  },
  vi: {
    loadingGraph: 'Đang tải Biểu đồ Kiến thức...',
    allCategories: 'Tất cả Danh mục',
    sortByLabel: 'Sắp xếp theo',
    sortLatest: 'Cập nhật mới nhất',
    sortHighestTrust: 'Tin cậy cao nhất',
    sortMostHumanReads: 'Lượt đọc của người nhiều nhất',
    sortMostAiReads: 'Lượt đọc của AI nhiều nhất',
    sortMostSaved: 'Được lưu nhiều nhất',
    sortMostVerified: 'Được xác minh nhiều nhất',
    minTrust: 'Độ tin cậy tối thiểu',
    authorNodeLabel: 'Node Tác giả',
    authorAll: 'Tất cả',
    authorHuman: 'Con người',
    activeFilters: 'Bộ lọc hoạt động:',
    searchLabel: (q) => `Tìm kiếm: "${q}"`,
    categoryLabel: (c) => `Danh mục: ${c}`,
    trustScoreLabel: (t) => `Độ tin cậy ≥ ${t}%`,
    authorLabelText: (a) => `Tác giả: ${a}`,
    authorHumanText: 'Con người',
    authorAiOrgText: 'AI / Tổ chức',
    clearAllFilters: 'Xóa tất cả bộ lọc'
  }
};

export default function Feed() {
  const { t, language } = useLanguage();
  const tLocal = localTranslations[language] || localTranslations.en;
  
  const [knowledge, setKnowledge] = useState<KnowledgeObject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'highest-trust' | 'most-read-human' | 'most-read-ai' | 'most-saved' | 'most-verified'>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [authorType, setAuthorType] = useState<'All' | 'Human' | 'AI'>('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => {
        setKnowledge(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching knowledge:', err);
        setLoading(false);
      });
  }, []);

  // Gather unique categories dynamically from real data
  const dynamicCategories = ['All', ...Array.from(new Set(knowledge.flatMap(ko => ko.categories || [])))];

  // Process filters and sorting
  const filteredAndSorted = knowledge
    .filter(ko => {
      // 1. Search filter
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchTitle = ko.title?.toLowerCase().includes(query);
        const matchProblem = ko.problem?.toLowerCase().includes(query);
        const matchTags = ko.tags?.some(t => t.toLowerCase().includes(query));
        const matchCategories = ko.categories?.some(c => c.toLowerCase().includes(query));
        const matchEntities = ko.entities?.some(e => e.toLowerCase().includes(query));
        if (!matchTitle && !matchProblem && !matchTags && !matchCategories && !matchEntities) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'All' && !ko.categories?.includes(selectedCategory)) {
        return false;
      }

      // 3. Minimum Trust Score filter
      if (ko.trustScore && ko.trustScore.overall < minTrustScore) {
        return false;
      }

      // 4. Author Type filter
      if (authorType !== 'All') {
        const isHuman = ko.authorId === 'id_human_1';
        if (authorType === 'Human' && !isHuman) return false;
        if (authorType === 'AI' && isHuman) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case 'highest-trust':
          return (b.trustScore?.overall || 0) - (a.trustScore?.overall || 0);
        case 'most-read-human':
          return (b.consumptionMetrics?.humanReads || 0) - (a.consumptionMetrics?.humanReads || 0);
        case 'most-read-ai':
          return (b.consumptionMetrics?.aiReads || 0) - (a.consumptionMetrics?.aiReads || 0);
        case 'most-saved':
          return (b.consumptionMetrics?.humanSaves || 0) - (a.consumptionMetrics?.humanSaves || 0);
        case 'most-verified':
          const aVer = a.verifications?.reduce((sum, v) => sum + v.count, 0) || 0;
          const bVer = b.verifications?.reduce((sum, v) => sum + v.count, 0) || 0;
          return bVer - aVer;
        default:
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
        <p className="text-sm font-medium">{tLocal.loadingGraph}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('feed.title')}</h1>
          <p className="text-xs text-slate-500 mt-1">{t('feed.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Main Sort Tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 shadow-xs">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                sortBy === 'latest'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{sortBy === 'latest' ? 'Latest' : 'Latest'}</span>
            </button>
            <button
              onClick={() => setSortBy('highest-trust')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                sortBy === 'highest-trust'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Highest Trust</span>
            </button>
          </div>

          {/* Advanced filters toggler */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              showAdvancedFilters || sortBy !== 'latest' && sortBy !== 'highest-trust'
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('challenges.filterTitle')}</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Search & Categories */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('feed.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-250 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>

          {/* Quick Category Selector */}
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-xs font-medium"
            >
              <option value="All">{tLocal.allCategories}</option>
              {dynamicCategories.filter(cat => cat !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filters Row */}
        {(showAdvancedFilters || sortBy !== 'latest' && sortBy !== 'highest-trust') && (
          <div className="pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Sort Dropdown */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                {tLocal.sortByLabel}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
              >
                <option value="latest">{tLocal.sortLatest}</option>
                <option value="highest-trust">{tLocal.sortHighestTrust}</option>
                <option value="most-read-human">{tLocal.sortMostHumanReads}</option>
                <option value="most-read-ai">{tLocal.sortMostAiReads}</option>
                <option value="most-saved">{tLocal.sortMostSaved}</option>
                <option value="most-verified">{tLocal.sortMostVerified}</option>
              </select>
            </div>

            {/* Minimum Trust Score Filter */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                {tLocal.minTrust}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md min-w-[42px] text-center">
                  {minTrustScore}%
                </span>
              </div>
            </div>

            {/* Author Type Filter */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                {tLocal.authorNodeLabel}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-white p-1 border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAuthorType('All')}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    authorType === 'All'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tLocal.authorAll}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorType('Human')}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    authorType === 'Human'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tLocal.authorHuman}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorType('AI')}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    authorType === 'AI'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  AI / Org
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Filters Summary */}
        {(selectedCategory !== 'All' || minTrustScore > 0 || authorType !== 'All' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/40">
            <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">{tLocal.activeFilters}</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-150 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {tLocal.searchLabel(searchQuery)}
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-150 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {tLocal.categoryLabel(selectedCategory)}
              </span>
            )}
            {minTrustScore > 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {tLocal.trustScoreLabel(minTrustScore)}
              </span>
            )}
            {authorType !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-150 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {tLocal.authorLabelText(authorType === 'Human' ? tLocal.authorHumanText : tLocal.authorAiOrgText)}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setMinTrustScore(0);
                setAuthorType('All');
                setSortBy('latest');
              }}
              className="text-[10px] text-rose-500 hover:text-rose-700 font-extrabold hover:underline ml-auto cursor-pointer"
            >
              {tLocal.clearAllFilters}
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Knowledge Feed Items */}
      {filteredAndSorted.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSorted.map(ko => (
            <div 
              key={ko.id} 
              onClick={() => navigate(`/knowledge/${ko.id}`)}
              className="group cursor-pointer block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-350 hover:shadow-md transition-all"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/knowledge/${ko.id}`);
                }
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Metadata labels row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-150">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      Trust Score {ko.trustScore.overall}%
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      v{ko.version} • {formatDistanceToNow(new Date(ko.updatedAt), { addSuffix: true })}
                    </span>
                    {ko.authorId === 'id_human_1' ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        <User className="w-2.5 h-2.5" /> Human Node
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                        <Cpu className="w-2.5 h-2.5" /> AI Node
                      </span>
                    )}
                  </div>
                  
                  {/* Title & description */}
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 leading-tight tracking-tight">
                    {ko.title}
                  </h2>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {ko.problem}
                  </p>
                  
                  {/* Tags, categories, entities tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {ko.categories?.map(cat => (
                      <Link
                        key={cat}
                        to={`/explore/tags?tab=categories&select=${encodeURIComponent(cat)}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors font-semibold"
                      >
                        <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                        {cat}
                      </Link>
                    ))}
                    {ko.tags.map(tag => (
                      <Link
                        key={tag}
                        to={`/explore/tags?tab=tags&select=${encodeURIComponent(tag)}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors font-semibold"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </Link>
                    ))}
                    {ko.entities?.map(ent => (
                      <Link
                        key={ent}
                        to={`/explore/tags?tab=entities&select=${encodeURIComponent(ent)}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded hover:bg-purple-100 transition-colors font-semibold"
                      >
                        <Network className="w-2.5 h-2.5 text-purple-500" />
                        {ent}
                      </Link>
                    ))}
                  </div>
                  
                  {/* Consumption stats metrics & authorship */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="font-medium">
                      Author:{' '}
                      <Link 
                        to={`/identity/${ko.authorId}`} 
                        className="font-bold text-blue-600 hover:underline" 
                        onClick={e => e.stopPropagation()}
                      >
                        {ko.authorId === 'id_human_1' ? 'Alice Developer' : ko.authorId === 'id_org_1' ? 'OpenAI' : 'Unknown'}
                      </Link>
                    </span>

                    {/* Show relevant metrics based on sorted type */}
                    <div className="flex items-center gap-3 ml-auto text-[11px] font-medium text-slate-400">
                      <span className="flex items-center gap-1" title="Human Reads">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {ko.consumptionMetrics?.humanReads?.toLocaleString() || 0} {t('feed.views')}
                      </span>
                      <span className="flex items-center gap-1" title="AI Reads / Syncs">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        {ko.consumptionMetrics?.aiReads?.toLocaleString() || 0} AI
                      </span>
                      <span className="flex items-center gap-1" title="Saves">
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        {ko.consumptionMetrics?.humanSaves?.toLocaleString() || 0} Saves
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Verifications & Action indicator */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      {t('feed.verified')}
                    </span>
                    <div className="flex -space-x-1.5">
                      {ko.verifications && ko.verifications.length > 0 ? (
                        ko.verifications.map((v, i) => (
                          <div 
                            key={i} 
                            className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center relative group shadow-xs" 
                            title={`${v.type}: ${v.count}`}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${i === 0 ? 'text-emerald-500' : 'text-blue-500'}`} />
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-slate-400 font-bold italic">Pending</div>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold flex items-center gap-0.5 group-hover:text-blue-600 transition-colors sm:mt-auto">
                    {t('feed.readMore')} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-900 font-bold">{t('feed.noResults')}</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting search terms, reducing the minimum trust score, or selecting another category to find nodes.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMinTrustScore(0);
              setAuthorType('All');
              setSortBy('latest');
            }}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-xs transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
