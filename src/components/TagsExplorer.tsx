import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Tag, Folder, Shield, Clock, BookOpen, Search, ArrowRight, Network, Database, Eye, Bookmark, Share2, HelpCircle, Activity, Filter, SlidersHorizontal } from 'lucide-react';
import { KnowledgeObject } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

interface LocalTranslation {
  searchFilterTitle: string;
  searchPlaceholder: string;
  typeMoreChars: (rem: number) => string;
  searchActive: (count: number) => string;
  minTrustScore: string;
  clearBasicFilter: string;
  envLabel: string;
  all: string;
  authorTypeLabel: string;
  human: string;
  aiAgent: string;
  org: string;
  minVerifications: string;
  times: string;
  sortByLabel: string;
  sortTrustScore: string;
  sortLastUpdated: string;
  sortMostSaves: string;
  sortMostReads: string;
  clearAllFilters: string;
  filteredFrom: (count: number) => string;
  noResultsTitle: string;
  noResultsDesc: string;
}

const localTranslations: Record<string, LocalTranslation> = {
  en: {
    searchFilterTitle: 'Search & Filter Nodes',
    searchPlaceholder: 'Type at least 3 characters to start Instant Search...',
    typeMoreChars: (rem) => `Type ${rem} more character${rem > 1 ? 's' : ''}`,
    searchActive: (count) => `Search active (${count} results)`,
    minTrustScore: 'Min Trust Score',
    clearBasicFilter: 'Clear Basic Filter',
    envLabel: 'Environment',
    all: 'All',
    authorTypeLabel: 'Author Type',
    human: 'Human',
    aiAgent: 'AI Agent',
    org: 'Organization',
    minVerifications: 'Min Verifications',
    times: 'times',
    sortByLabel: 'Sort By',
    sortTrustScore: 'Highest Trust Score',
    sortLastUpdated: 'Last Updated',
    sortMostSaves: 'Most Saves',
    sortMostReads: 'Most Reads',
    clearAllFilters: 'Clear All Filters',
    filteredFrom: (count) => `Filtered from ${count} nodes`,
    noResultsTitle: 'No Nodes Match Criteria',
    noResultsDesc: 'Try adjusting or clearing your filters to search again.',
  },
  th: {
    searchFilterTitle: 'ระบบค้นหาและกรองข้อมูล Node (Search & Filter)',
    searchPlaceholder: 'พิมพ์อย่างน้อย 3 ตัวอักษร เพื่อเริ่มค้นหาใน Node ทันที (Instant Search)...',
    typeMoreChars: (rem) => `พิมพ์อีก ${rem} ตัวอักษร`,
    searchActive: (count) => `ค้นหาทำงานอยู่ (${count} ผลลัพธ์)`,
    minTrustScore: 'ค่าความน่าเชื่อถือขั้นต่ำ (Min Trust Score)',
    clearBasicFilter: 'ล้างตัวกรอง Basic',
    envLabel: 'สภาพแวดล้อม (Environment)',
    all: 'ทั้งหมด (All)',
    authorTypeLabel: 'ประเภทผู้สร้าง (Author Type)',
    human: 'มนุษย์ (Human)',
    aiAgent: 'บอท AI (AI Agent)',
    org: 'องค์กร (Organization)',
    minVerifications: 'การตรวจสอบขั้นต่ำ',
    times: 'ครั้ง',
    sortByLabel: 'เรียงตาม (Sort By)',
    sortTrustScore: 'ความเชื่อถือสูงสุด (Trust Score)',
    sortLastUpdated: 'อัปเดตล่าสุด (Last Updated)',
    sortMostSaves: 'บัน উল্লেখযোগ্য (Most Saves)', // fixed error
    sortMostReads: 'ยอดอ่านสูงสุด (Most Reads)',
    clearAllFilters: 'ล้างตัวกรองทั้งหมด',
    filteredFrom: (count) => `กรองจากทั้งหมด ${count} nodes`,
    noResultsTitle: 'ไม่พบข้อมูล Node ตรงตามเงื่อนไข',
    noResultsDesc: 'ลองปรับปรุงหรือล้างตัวกรอง เพื่อค้นหาข้อมูลอีกครั้ง',
  },
  ja: {
    searchFilterTitle: 'ノードの検索とフィルタリング',
    searchPlaceholder: 'インスタント検索を開始するには3文字以上入力してください...',
    typeMoreChars: (rem) => `あと ${rem} 文字入力`,
    searchActive: (count) => `検索結果 (${count} 件)`,
    minTrustScore: '最小信頼スコア',
    clearBasicFilter: '基本フィルターをクリア',
    envLabel: '環境',
    all: 'すべて',
    authorTypeLabel: '作成者タイプ',
    human: '人間',
    aiAgent: 'AI エージェント',
    org: '組織',
    minVerifications: '最小検証回数',
    times: '回',
    sortByLabel: '並び替え',
    sortTrustScore: '最高信頼スコア',
    sortLastUpdated: '最終更新',
    sortMostSaves: '保存数が多い',
    sortMostReads: '閲覧数が多い',
    clearAllFilters: 'すべてのフィルターをクリア',
    filteredFrom: (count) => `全 ${count} ノードからフィルタリング`,
    noResultsTitle: '条件に一致するノードが見つかりません',
    noResultsDesc: '検索条件を変更するか、フィルターをクリアしてください。',
  },
  zh: {
    searchFilterTitle: '搜索和过滤节点',
    searchPlaceholder: '输入至少 3 个字符开始即时搜索...',
    typeMoreChars: (rem) => `再输入 ${rem} 个字符`,
    searchActive: (count) => `搜索中 (${count} 个结果)`,
    minTrustScore: '最低信任分数',
    clearBasicFilter: '清除基本过滤',
    envLabel: '环境',
    all: '全部',
    authorTypeLabel: '创建者类型',
    human: '人类',
    aiAgent: 'AI 代理',
    org: '组织',
    minVerifications: '最低验证次数',
    times: '次',
    sortByLabel: '排序方式',
    sortTrustScore: '最高信任分',
    sortLastUpdated: '最近更新',
    sortMostSaves: '最多保存',
    sortMostReads: '最多阅读',
    clearAllFilters: '清除所有过滤器',
    filteredFrom: (count) => `从 ${count} 个节点中过滤`,
    noResultsTitle: '没有匹配条件的节点',
    noResultsDesc: '请尝试调整或清除过滤器以重新搜索。',
  },
  ko: {
    searchFilterTitle: '노드 검색 및 필터',
    searchPlaceholder: '3자 이상 입력하여 즉시 검색 시작...',
    typeMoreChars: (rem) => `${rem}자 더 입력하세요`,
    searchActive: (count) => `검색 활성화됨 (${count}개 결과)`,
    minTrustScore: '최소 신뢰 점수',
    clearBasicFilter: '기본 필터 지우기',
    envLabel: '환경',
    all: '전체',
    authorTypeLabel: '작성자 유형',
    human: '인간',
    aiAgent: 'AI 에이전트',
    org: '조직',
    minVerifications: '최소 검증 횟수',
    times: '회',
    sortByLabel: '정렬 기준',
    sortTrustScore: '가장 높은 신뢰 점수',
    sortLastUpdated: '최근 업데이트',
    sortMostSaves: '가장 많이 저장됨',
    sortMostReads: '가장 많이 읽음',
    clearAllFilters: '모든 필터 지우기',
    filteredFrom: (count) => `${count}개 노드에서 필터링됨`,
    noResultsTitle: '조건과 일치하는 노드가 없습니다',
    noResultsDesc: '필터를 조정하거나 지우고 다시 검색해보세요.',
  },
  de: {
    searchFilterTitle: 'Knoten Suchen & Filtern',
    searchPlaceholder: 'Geben Sie mindestens 3 Zeichen ein, um die Sofortsuche zu starten...',
    typeMoreChars: (rem) => `Noch ${rem} Zeichen eingeben`,
    searchActive: (count) => `Suche aktiv (${count} Ergebnisse)`,
    minTrustScore: 'Min Vertrauenswert',
    clearBasicFilter: 'Basisfilter löschen',
    envLabel: 'Umgebung',
    all: 'Alle',
    authorTypeLabel: 'Autortyp',
    human: 'Mensch',
    aiAgent: 'KI-Agent',
    org: 'Organisation',
    minVerifications: 'Min Verifizierungen',
    times: 'mal',
    sortByLabel: 'Sortieren nach',
    sortTrustScore: 'Höchster Vertrauenswert',
    sortLastUpdated: 'Zuletzt aktualisiert',
    sortMostSaves: 'Meiste Speicherungen',
    sortMostReads: 'Am meisten gelesen',
    clearAllFilters: 'Alle Filter löschen',
    filteredFrom: (count) => `Gefiltert aus ${count} Knoten`,
    noResultsTitle: 'Keine passenden Knoten',
    noResultsDesc: 'Versuchen Sie, Ihre Filter anzupassen oder zu löschen.',
  },
  fr: {
    searchFilterTitle: 'Rechercher et Filtrer les Nœuds',
    searchPlaceholder: 'Tapez au moins 3 caractères pour lancer la recherche...',
    typeMoreChars: (rem) => `Encore ${rem} caractère(s)`,
    searchActive: (count) => `Recherche active (${count} résultats)`,
    minTrustScore: 'Score de confiance min',
    clearBasicFilter: 'Effacer filtre de base',
    envLabel: 'Environnement',
    all: 'Tout',
    authorTypeLabel: 'Type d\'Auteur',
    human: 'Humain',
    aiAgent: 'Agent IA',
    org: 'Organisation',
    minVerifications: 'Vérifications min',
    times: 'fois',
    sortByLabel: 'Trier par',
    sortTrustScore: 'Meilleur score de confiance',
    sortLastUpdated: 'Dernière mise à jour',
    sortMostSaves: 'Le plus sauvegardé',
    sortMostReads: 'Le plus lu',
    clearAllFilters: 'Effacer tous les filtres',
    filteredFrom: (count) => `Filtré parmi ${count} nœuds`,
    noResultsTitle: 'Aucun nœud correspondant',
    noResultsDesc: 'Essayez d\'ajuster ou d\'effacer vos filtres.',
  },
  es: {
    searchFilterTitle: 'Buscar y Filtrar Nodos',
    searchPlaceholder: 'Escriba al menos 3 caracteres para iniciar la búsqueda...',
    typeMoreChars: (rem) => `Escriba ${rem} carácter(es) más`,
    searchActive: (count) => `Búsqueda activa (${count} resultados)`,
    minTrustScore: 'Puntuación de confianza min',
    clearBasicFilter: 'Limpiar filtro básico',
    envLabel: 'Entorno',
    all: 'Todo',
    authorTypeLabel: 'Tipo de Autor',
    human: 'Humano',
    aiAgent: 'Agente IA',
    org: 'Organización',
    minVerifications: 'Verificaciones mínimas',
    times: 'veces',
    sortByLabel: 'Ordenar por',
    sortTrustScore: 'Mayor puntuación de confianza',
    sortLastUpdated: 'Última actualización',
    sortMostSaves: 'Más guardados',
    sortMostReads: 'Más leídos',
    clearAllFilters: 'Limpiar todos los filtros',
    filteredFrom: (count) => `Filtrado de ${count} nodos`,
    noResultsTitle: 'No hay nodos que coincidan',
    noResultsDesc: 'Intente ajustar o limpiar sus filtros.',
  },
  ru: {
    searchFilterTitle: 'Поиск и фильтрация узлов',
    searchPlaceholder: 'Введите минимум 3 символа для мгновенного поиска...',
    typeMoreChars: (rem) => `Введите еще ${rem} символ(ов)`,
    searchActive: (count) => `Поиск активен (${count} результатов)`,
    minTrustScore: 'Мин. индекс доверия',
    clearBasicFilter: 'Сбросить базовый фильтр',
    envLabel: 'Среда',
    all: 'Все',
    authorTypeLabel: 'Тип автора',
    human: 'Человек',
    aiAgent: 'ИИ-Агент',
    org: 'Организация',
    minVerifications: 'Мин. проверок',
    times: 'раз',
    sortByLabel: 'Сортировать по',
    sortTrustScore: 'Высший индекс доверия',
    sortLastUpdated: 'Последнее обновление',
    sortMostSaves: 'Больше всего сохранений',
    sortMostReads: 'Больше всего прочтений',
    clearAllFilters: 'Сбросить все фильтры',
    filteredFrom: (count) => `Отфильтровано из ${count} узлов`,
    noResultsTitle: 'Узлы не найдены',
    noResultsDesc: 'Попробуйте изменить или сбросить фильтры.',
  },
  vi: {
    searchFilterTitle: 'Tìm kiếm & Lọc Node',
    searchPlaceholder: 'Nhập ít nhất 3 ký tự để tìm kiếm tức thì...',
    typeMoreChars: (rem) => `Nhập thêm ${rem} ký tự`,
    searchActive: (count) => `Tìm kiếm hoạt động (${count} kết quả)`,
    minTrustScore: 'Điểm tin cậy tối thiểu',
    clearBasicFilter: 'Xóa bộ lọc cơ bản',
    envLabel: 'Môi trường',
    all: 'Tất cả',
    authorTypeLabel: 'Loại tác giả',
    human: 'Con người',
    aiAgent: 'Đại lý AI',
    org: 'Tổ chức',
    minVerifications: 'Số lần xác minh tối thiểu',
    times: 'lần',
    sortByLabel: 'Sắp xếp theo',
    sortTrustScore: 'Điểm tin cậy cao nhất',
    sortLastUpdated: 'Cập nhật mới nhất',
    sortMostSaves: 'Được lưu nhiều nhất',
    sortMostReads: 'Được đọc nhiều nhất',
    clearAllFilters: 'Xóa tất cả bộ lọc',
    filteredFrom: (count) => `Đã lọc từ ${count} node`,
    noResultsTitle: 'Không có node nào phù hợp',
    noResultsDesc: 'Vui lòng điều chỉnh hoặc xóa bộ lọc để tìm kiếm lại.',
  }
};

export default function TagsExplorer() {
  const { language } = useLanguage();
  const tLocal = localTranslations[language] || localTranslations.en;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'tags'; // 'tags', 'categories', 'entities'
  const initialSelection = searchParams.get('select') || '';

  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [identities, setIdentities] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeObject[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>(initialSelection);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [filterMode, setFilterMode] = useState<'basic' | 'advanced'>('basic');
  const [searchNodeText, setSearchNodeText] = useState('');
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [envFilter, setEnvFilter] = useState<string>('All');
  const [minVerifications, setMinVerifications] = useState<number>(0);
  const [authorTypeFilter, setAuthorTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'trustScore' | 'updatedAt' | 'saves' | 'reads'>('trustScore');

  useEffect(() => {
    setSelectedItem(initialSelection);
  }, [initialSelection]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagsRes, catsRes, entsRes, knowRes, idenRes] = await Promise.all([
          fetch('/api/tags'),
          fetch('/api/categories'),
          fetch('/api/entities'),
          fetch('/api/knowledge'),
          fetch('/api/identities')
        ]);
        const tagsData = await tagsRes.json();
        const catsData = await catsRes.json();
        const entsData = await entsRes.json();
        const knowData = await knowRes.json();
        const idenData = await idenRes.json();

        setTags(tagsData);
        setCategories(catsData);
        setEntities(entsData);
        setKnowledge(knowData);
        setIdentities(idenData);

        // Auto-select based on highest count if none is chosen
        if (!initialSelection) {
          if (activeTab === 'tags' && tagsData.length > 0) {
            setSelectedItem(tagsData[0].tag);
          } else if (activeTab === 'categories' && catsData.length > 0) {
            setSelectedItem(catsData[0].category);
          } else if (activeTab === 'entities' && entsData.length > 0) {
            setSelectedItem(entsData[0].entity);
          }
        }
      } catch (err) {
        console.error('Error loading tags explorer data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab, initialSelection]);

  const handleTabChange = (tab: 'tags' | 'categories' | 'entities') => {
    setSearchParams({ tab });
    setSelectedItem('');
    setSearchQuery('');
  };

  const handleSelect = (name: string) => {
    setSearchParams({ tab: activeTab, select: name });
    setSelectedItem(name);
  };

  const filteredItems = activeTab === 'tags'
    ? tags.filter(t => t.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeTab === 'categories'
    ? categories.filter(c => c.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : entities.filter(e => e.entity.toLowerCase().includes(searchQuery.toLowerCase()));

  const matchingKnowledge = knowledge.filter(k => {
    if (!selectedItem) return false;
    
    // Taxonomy match
    let matchesTaxonomy = false;
    if (activeTab === 'tags') {
      matchesTaxonomy = k.tags.some(t => t.toLowerCase() === selectedItem.toLowerCase());
    } else if (activeTab === 'categories') {
      matchesTaxonomy = k.categories?.some(c => c.toLowerCase() === selectedItem.toLowerCase());
    } else {
      matchesTaxonomy = k.entities?.some(e => e.toLowerCase() === selectedItem.toLowerCase());
    }
    
    if (!matchesTaxonomy) return false;

    // Basic search filtering: only triggers when search length is at least 3 characters
    if (searchNodeText.trim().length >= 3) {
      const query = searchNodeText.toLowerCase();
      const matchesText = 
        k.title.toLowerCase().includes(query) ||
        (k.problem && k.problem.toLowerCase().includes(query)) ||
        (k.solution && k.solution.toLowerCase().includes(query)) ||
        (k.context && k.context.toLowerCase().includes(query));
      if (!matchesText) return false;
    }

    // Minimum trust score (Basic & Advanced)
    if (k.trustScore.overall < minTrustScore) return false;

    // Advanced Filters
    if (filterMode === 'advanced') {
      // Minimum verifications
      const totalVerifications = k.verifications?.reduce((acc, v) => acc + v.count, 0) || 0;
      if (totalVerifications < minVerifications) return false;

      // Author Type
      if (authorTypeFilter !== 'All') {
        const authorObj = identities.find(i => i.id === k.authorId);
        const authorType = authorObj ? authorObj.type : 'Human';
        if (authorType !== authorTypeFilter) return false;
      }

      // Environment
      if (envFilter !== 'All') {
        const queryEnv = envFilter.toLowerCase();
        const hasEnv = 
          (k.evidence && k.evidence.toLowerCase().includes(queryEnv)) ||
          k.entities?.some(e => e.toLowerCase().includes(queryEnv)) ||
          k.tags?.some(t => t.toLowerCase().includes(queryEnv));
        if (!hasEnv) return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedMatchingKnowledge = [...matchingKnowledge].sort((a, b) => {
    if (sortBy === 'trustScore') {
      return b.trustScore.overall - a.trustScore.overall;
    } else if (sortBy === 'updatedAt') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'saves') {
      const aSaves = a.consumptionMetrics?.humanSaves || 0;
      const bSaves = b.consumptionMetrics?.humanSaves || 0;
      return bSaves - aSaves;
    } else if (sortBy === 'reads') {
      const aReads = (a.consumptionMetrics?.humanReads || 0) + (a.consumptionMetrics?.aiReads || 0);
      const bReads = (b.consumptionMetrics?.humanReads || 0) + (b.consumptionMetrics?.aiReads || 0);
      return bReads - aReads;
    }
    return 0;
  });

  const selectedEntityObj = activeTab === 'entities'
    ? entities.find(e => e.entity.toLowerCase() === selectedItem?.toLowerCase())
    : null;

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 animate-pulse">
        <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" />
        Loading Explorer Ecosystem...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300" id="tags-explorer-page">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          {activeTab === 'tags' ? (
            <Tag className="w-8 h-8 text-blue-600" />
          ) : activeTab === 'categories' ? (
            <Folder className="w-8 h-8 text-indigo-600" />
          ) : (
            <Network className="w-8 h-8 text-purple-600 animate-pulse" />
          )}
          Knowledge Graph Explorer
        </h1>
        <p className="text-slate-500 mt-1">Discover, trace, and inspect verified information nodes grouped by taxonomy & semantic links.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => handleTabChange('tags')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tags'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="tab-toggle-tags"
        >
          Tags Discovery
        </button>
        <button
          onClick={() => handleTabChange('categories')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="tab-toggle-categories"
        >
          Categories Directory
        </button>
        <button
          onClick={() => handleTabChange('entities')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'entities'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="tab-toggle-entities"
        >
          <Network className="w-4 h-4 shrink-0" />
          Knowledge Graph Entities
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Selector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 max-h-[50vh] lg:max-h-none lg:h-[calc(100vh-250px)] overflow-y-auto lg:sticky lg:top-24">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No taxonomies match your query</p>
            ) : (
              filteredItems.map(item => {
                const name = activeTab === 'tags'
                  ? (item as any).tag
                  : activeTab === 'categories'
                  ? (item as any).category
                  : (item as any).entity;
                const isSelected = selectedItem?.toLowerCase() === name.toLowerCase();
                return (
                  <button
                    key={name}
                    onClick={() => handleSelect(name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left cursor-pointer ${
                      isSelected
                        ? activeTab === 'tags'
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                          : activeTab === 'categories'
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                          : 'bg-purple-50 text-purple-700 font-bold border border-purple-100'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedItem ? (
            <div>
              {activeTab === 'entities' && selectedEntityObj ? (
                /* Dynamic Entity and Stats View */
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Entity Header Banner */}
                  <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10">
                      <Network className="w-64 h-64 text-purple-400" />
                    </div>
                    <div className="relative z-10 space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-800/60">
                          {selectedEntityObj.type}
                        </span>
                        <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                          {matchingKnowledge.length} Connected {matchingKnowledge.length === 1 ? 'Node' : 'Nodes'}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                        <Database className="w-7 h-7 text-purple-400 shrink-0" />
                        {selectedEntityObj.entity}
                      </h2>
                      <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                        {selectedEntityObj.description}
                      </p>
                    </div>
                  </div>

                  {/* Real-time Dynamic Statistics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Node Mentions</p>
                      <p className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1">
                        <Network className="w-5 h-5 text-blue-500" />
                        {selectedEntityObj.count}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Composite Trust</p>
                      <p className="text-2xl font-black text-green-600 flex items-center justify-center gap-1">
                        <Shield className="w-5 h-5 text-green-500 animate-pulse" />
                        {selectedEntityObj.averageTrustScore}%
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cumulative Reads</p>
                      <p className="text-2xl font-black text-purple-600 flex items-center justify-center gap-1">
                        <Eye className="w-5 h-5 text-purple-500" />
                        {selectedEntityObj.totalReads.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Saved</p>
                      <p className="text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
                        <Bookmark className="w-5 h-5 text-amber-500" />
                        {selectedEntityObj.totalSaves.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Graph connections & semantic edges panel */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-purple-500" />
                      Semantic Graph Connections (Nodes & Edges)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sibling Entities */}
                      <div className="bg-white p-3.5 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                          <span>🔗</span> Co-occurring Sibling Entities
                        </h4>
                        {selectedEntityObj.relatedEntities.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No co-occurring entities in this node.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedEntityObj.relatedEntities.map((sibling: string) => (
                              <button
                                key={sibling}
                                onClick={() => handleSelect(sibling)}
                                className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-purple-100"
                              >
                                {sibling}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Associated Tags */}
                      <div className="bg-white p-3.5 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                          <span>🏷️</span> Connected Taxonomy Tags
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEntityObj.relatedTags.map((tag: string) => (
                            <button
                              key={tag}
                              onClick={() => {
                                handleTabChange('tags');
                                setSearchParams({ tab: 'tags', select: tag });
                                setSelectedItem(tag);
                              }}
                              className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-blue-100"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Classic Taxonomy Header Banner */
                <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Selected Taxonomy</span>
                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                      {sortedMatchingKnowledge.length} {sortedMatchingKnowledge.length === 1 ? 'Object' : 'Objects'} Listed
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold flex items-center gap-2">
                    {activeTab === 'tags' ? '#' : ''}{selectedItem}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Displaying authenticated SOTYAI nodes carrying evidence-backed knowledge tagged with <strong className="text-white">{selectedItem}</strong>.
                  </p>
                </div>
              )}

              {/* Modern Filters & Search Ledger */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-slate-500" />
                    <h3 className="font-bold text-slate-800 text-sm">{tLocal.searchFilterTitle}</h3>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setFilterMode('basic')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${filterMode === 'basic' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Basic Filter
                    </button>
                    <button
                      onClick={() => setFilterMode('advanced')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${filterMode === 'advanced' ? 'bg-white text-purple-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Advanced Filter
                    </button>
                  </div>
                </div>

                {/* Instant Search Bar (Basic) */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchNodeText}
                    onChange={(e) => setSearchNodeText(e.target.value)}
                    placeholder={tLocal.searchPlaceholder}
                    className="w-full pl-10 pr-32 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchNodeText.trim().length > 0 && searchNodeText.trim().length < 3 ? (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium animate-pulse">
                        {tLocal.typeMoreChars(3 - searchNodeText.trim().length)}
                      </span>
                    ) : searchNodeText.trim().length >= 3 ? (
                      <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 font-bold">
                        {tLocal.searchActive(sortedMatchingKnowledge.length)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Dynamic Filters depending on Basic / Advanced */}
                {filterMode === 'basic' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 flex justify-between">
                        <span>{tLocal.minTrustScore}</span>
                        <span className="text-blue-600 font-bold">{minTrustScore}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={minTrustScore}
                        onChange={(e) => setMinTrustScore(Number(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      {(searchNodeText || minTrustScore > 0) && (
                        <button
                          onClick={() => {
                            setSearchNodeText('');
                            setMinTrustScore(0);
                          }}
                          className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-semibold"
                        >
                          {tLocal.clearBasicFilter}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Env Filter */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">{tLocal.envLabel}</label>
                        <select
                          value={envFilter}
                          onChange={(e) => setEnvFilter(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="All">{tLocal.all}</option>
                          <option value="React 19">React 19</option>
                          <option value="Node">Node.js</option>
                          <option value="JavaScript">JavaScript</option>
                          <option value="MCP">MCP</option>
                          <option value="Knowledge Graph">Knowledge Graph</option>
                        </select>
                      </div>

                      {/* Author Type */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">{tLocal.authorTypeLabel}</label>
                        <select
                          value={authorTypeFilter}
                          onChange={(e) => setAuthorTypeFilter(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="All">{tLocal.all}</option>
                          <option value="Human">{tLocal.human}</option>
                          <option value="AI Agent">{tLocal.aiAgent}</option>
                          <option value="Organization">{tLocal.org}</option>
                        </select>
                      </div>

                      {/* Min Verifications */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 flex justify-between">
                          <span>{tLocal.minVerifications}</span>
                          <span className="font-bold text-slate-700">{minVerifications} {tLocal.times}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={minVerifications}
                          onChange={(e) => setMinVerifications(Number(e.target.value))}
                          className="w-full accent-purple-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Sort By */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">{tLocal.sortByLabel}</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="trustScore">{tLocal.sortTrustScore}</option>
                          <option value="updatedAt">{tLocal.sortLastUpdated}</option>
                          <option value="saves">{tLocal.sortMostSaves}</option>
                          <option value="reads">{tLocal.sortMostReads}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 flex gap-2">
                          <span>{tLocal.minTrustScore}:</span>
                          <span className="text-purple-600 font-bold">{minTrustScore}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={minTrustScore}
                          onChange={(e) => setMinTrustScore(Number(e.target.value))}
                          className="w-48 accent-purple-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setSearchNodeText('');
                          setMinTrustScore(0);
                          setEnvFilter('All');
                          setMinVerifications(0);
                          setAuthorTypeFilter('All');
                          setSortBy('trustScore');
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-semibold"
                      >
                        {tLocal.clearAllFilters}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Matching Knowledge List Section */}
              <div className="mt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between">
                  <span>Connected Verifiable SOTYAI Nodes ({sortedMatchingKnowledge.length})</span>
                  {sortedMatchingKnowledge.length !== matchingKnowledge.length && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-100 normal-case">
                      {tLocal.filteredFrom(matchingKnowledge.length)}
                    </span>
                  )}
                </h3>
                
                {sortedMatchingKnowledge.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{tLocal.noResultsTitle}</h3>
                    <p className="text-sm text-slate-500 mb-4">{tLocal.noResultsDesc}</p>
                    <button 
                      onClick={() => {
                        setSearchNodeText('');
                        setMinTrustScore(0);
                        setEnvFilter('All');
                        setMinVerifications(0);
                        setAuthorTypeFilter('All');
                        setSortBy('trustScore');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      {tLocal.clearAllFilters}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedMatchingKnowledge.map(ko => (
                      <Link
                        key={ko.id}
                        to={`/knowledge/${ko.id}`}
                        className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-slate-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                            {ko.title}
                          </h3>
                          <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded">
                            v{ko.version}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-3 mb-4">{ko.problem || ko.context}</p>

                        <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                            <Shield className="w-3.5 h-3.5" /> Trust Score: {ko.trustScore.overall}
                          </span>
                          
                          {ko.entities && ko.entities.length > 0 && (
                            <div className="flex gap-1">
                              {ko.entities.slice(0, 3).map(ent => (
                                <button
                                  key={ent}
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTabChange('entities');
                                    handleSelect(ent);
                                  }}
                                  className="bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors"
                                >
                                  {ent}
                                </button>
                              ))}
                            </div>
                          )}

                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> updated {formatDistanceToNow(new Date(ko.updatedAt), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1 hover:underline text-blue-600 font-semibold ml-auto">
                            Inspect Node <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Select an Item</h3>
              <p className="text-sm text-slate-500">Please choose a tag, category or entity from the left sidebar directory to explore matching nodes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
