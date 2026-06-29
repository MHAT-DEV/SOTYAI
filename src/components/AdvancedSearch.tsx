import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight, Shield, Clock, BookOpen, User, Bot, Box, CheckCircle2, Star, Tag, RotateCcw, Save, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';
import { KnowledgeObject, Identity } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

interface LocalTranslation {
  title: string;
  subtitle: string;
  resetFilter: string;
  saveSearch: string;
  searchPlaceholder: string;
  typeMoreText: (rem: number) => string;
  searchActiveText: (count: number) => string;
  basicFilters: string;
  advancedFilters: string;
  searchScope: string;
  scopeAll: string;
  scopeTitle: string;
  scopeProblem: string;
  scopeSolution: string;
  minTrustScore: string;
  trustAll: string;
  trustMid: string;
  trustHigh: string;
  quickEnv: string;
  techEnv: string;
  allEnv: string;
  creatorType: string;
  allCreators: string;
  humanDev: string;
  aiBot: string;
  org: string;
  minVerifications: string;
  times: string;
  nodeStatus: string;
  allNodes: string;
  verifiedNodes: string;
  draftNodes: string;
  timeRange: string;
  rangeAll: string;
  range24h: string;
  range7d: string;
  range30d: string;
  sortBy: string;
  sortTrust: string;
  sortUpdated: string;
  sortSaves: string;
  sortReads: string;
  savedSearches: (count: number) => string;
  resultsTitle: (count: number) => string;
  filteredFrom: (total: number) => string;
  searchingMsg: string;
  noResultsTitle: string;
  noResultsSubSearch: string;
  noResultsSubEmpty: string;
  clearAllAndShowAll: string;
  verifications: string;
  savesText: string;
  readsText: string;
  saveSearchModalTitle: string;
  saveSearchModalDesc: string;
  saveSearchNameLabel: string;
  saveSearchNamePlaceholder: string;
  queryLabel: string;
  noQuery: string;
  scoreLabel: string;
  envLabel: string;
  authorLabel: string;
  cancel: string;
  confirmSave: string;
}

const localTranslations: Record<string, LocalTranslation> = {
  en: {
    title: 'Advanced Search Dashboard',
    subtitle: 'Search, verify, and analyze data in the SOTYAI Verifiable Knowledge Graph with high-quality filters',
    resetFilter: 'Reset Filters',
    saveSearch: 'Save Search',
    searchPlaceholder: 'Type at least 3 characters to search (e.g. React, Node.js)...',
    typeMoreText: (rem) => `⚠️ Type at least ${rem} more characters to enable real-time search`,
    searchActiveText: (count) => `✓ Real-time search active: Found ${count} matching results`,
    basicFilters: 'Basic Filters',
    advancedFilters: 'Advanced Filters',
    searchScope: 'Search Scope',
    scopeAll: 'All Fields',
    scopeTitle: 'Title Only',
    scopeProblem: 'Problem/Context',
    scopeSolution: 'Solution',
    minTrustScore: 'Min Trust Score',
    trustAll: '0% (All)',
    trustMid: '50% (Medium)',
    trustHigh: '80%+ (Verified)',
    quickEnv: 'Quick Environment',
    techEnv: 'Technology / Environment',
    allEnv: 'All Environments',
    creatorType: 'Creator Type',
    allCreators: 'All Identity Types',
    humanDev: 'Human Developer',
    aiBot: 'Autonomous AI',
    org: 'Verified Organization',
    minVerifications: 'Min Verifications',
    times: 'times',
    nodeStatus: 'Node Status',
    allNodes: 'All Nodes',
    verifiedNodes: 'Highly Verified (Trust Score ≥ 80)',
    draftNodes: 'Draft / Unverified (Trust Score < 80)',
    timeRange: 'Time Range',
    rangeAll: 'All Time',
    range24h: 'Last 24 Hours',
    range7d: 'Last 7 Days',
    range30d: 'Last 30 Days',
    sortBy: 'Sort Results By',
    sortTrust: 'Highest Trust Score',
    sortUpdated: 'Recently Updated',
    sortSaves: 'Highest Saves',
    sortReads: 'Most Read Nodes',
    savedSearches: (count) => `Your Saved Searches (${count})`,
    resultsTitle: (count) => `SOTYAI Node Search Results (${count})`,
    filteredFrom: (total) => `Showing results filtered from a total of ${total} Nodes`,
    searchingMsg: 'Querying network information...',
    noResultsTitle: 'No Matching Nodes Found',
    noResultsSubSearch: 'Please enter at least 3 characters to start searching immediately.',
    noResultsSubEmpty: 'No knowledge nodes match your current search query or filters.',
    clearAllAndShowAll: 'Clear Filters & Show All',
    verifications: 'Verifications',
    savesText: 'Saves',
    readsText: 'Reads',
    saveSearchModalTitle: 'Save Search Query Filter',
    saveSearchModalDesc: 'Name this search filter for quick access in the future.',
    saveSearchNameLabel: 'Search Query Name',
    saveSearchNamePlaceholder: 'e.g. React 19 High Trust...',
    queryLabel: 'Query:',
    noQuery: '(No query)',
    scoreLabel: 'Min Score:',
    envLabel: 'Environment:',
    authorLabel: 'Author Type:',
    cancel: 'Cancel',
    confirmSave: 'Confirm Save'
  },
  th: {
    title: 'ระบบค้นหาขั้นสูง (Advanced Search Dashboard)',
    subtitle: 'ค้นหา ตรวจสอบ และวิเคราะห์ข้อมูลใน SOTYAI Verifiable Knowledge Graph ด้วยระบบตัวกรองคุณภาพสูง',
    resetFilter: 'ล้างตัวกรอง (Reset)',
    saveSearch: 'บันทึกการค้นหา (Save Search)',
    searchPlaceholder: 'พิมพ์คำค้นหาของคุณ เช่น React, Node.js, MCP, machine learning (พิมพ์ 3 ตัวอักษรขึ้นไป)...',
    typeMoreText: (rem) => `⚠️ พิมพ์อีกอย่างน้อย ${rem} ตัวอักษร เพื่อให้ผลการค้นหาทำงานเรียลไทม์`,
    searchActiveText: (count) => `✓ ค้นหาเรียลไทม์ทำงานแล้ว: พบ ${count} ผลลัพธ์ที่ตรงเงื่อนไข`,
    basicFilters: 'ตัวกรองทั่วไป (Basic Filters)',
    advancedFilters: 'ตัวกรองระดับสูง (Advanced Filters)',
    searchScope: 'ขอบเขตคำค้นหา (Search Scope)',
    scopeAll: 'ค้นหาทุกฟิลด์',
    scopeTitle: 'หัวข้อเท่านั้น',
    scopeProblem: 'ปัญหา/บริบท',
    scopeSolution: 'วิธีการแก้ไข',
    minTrustScore: 'คะแนนความน่าเชื่อถือขั้นต่ำ',
    trustAll: '0% (ทั้งหมด)',
    trustMid: '50% (ปานกลาง)',
    trustHigh: '80%+ (ยืนยันแล้ว)',
    quickEnv: 'สภาพแวดล้อมด่วน (Quick Environment)',
    techEnv: 'เทคโนโลยี / สภาพแวดล้อม',
    allEnv: 'ทั้งหมด (All Environments)',
    creatorType: 'ประเภทผู้บันทึก (Creator Type)',
    allCreators: 'ทั้งหมด (All Identity Types)',
    humanDev: 'มนุษย์ (Human Developer)',
    aiBot: 'บอท AI (Autonomous AI)',
    org: 'องค์กร (Verified Organization)',
    minVerifications: 'การตรวจสอบขั้นต่ำ',
    times: 'ครั้ง',
    nodeStatus: 'สถานะการยืนยันโหนด',
    allNodes: 'ทั้งหมด (All Nodes)',
    verifiedNodes: 'โหนดยืนยันแล้วระดับสูง (Trust Score ≥ 80)',
    draftNodes: 'โหมดร่าง / ยังไม่ได้ยืนยัน (Trust Score < 80)',
    timeRange: 'ช่วงเวลาอัปเดตข้อมูล (Time Range)',
    rangeAll: 'ทั้งหมด',
    range24h: '24 ชั่วโมง',
    range7d: '7 วันที่ผ่านมา',
    range30d: '30 วันล่าสุด',
    sortBy: 'จัดเรียงผลลัพธ์การค้นหา (Sort By)',
    sortTrust: 'ความเชื่อถือรวมสูงสุด (Highest Trust Score)',
    sortUpdated: 'อัปเดตล่าสุด (Recently Updated)',
    sortSaves: 'บันทึกสะสมสูงสุด (Highest Saves)',
    sortReads: 'ยอดการเปิดอ่านสูงสุด (Most Read Nodes)',
    savedSearches: (count) => `การค้นหาที่บันทึกไว้ของคุณ (Your Saved Searches - ${count})`,
    resultsTitle: (count) => `ผลลัพธ์การค้นหาโหนด SOTYAI (${count})`,
    filteredFrom: (total) => `แสดงผลกรองจากข้อมูลทั้งหมด ${total} Nodes`,
    searchingMsg: 'กำลังสืบค้นสารสนเทศของเครือข่าย...',
    noResultsTitle: 'ไม่พบข้อมูลโหนดที่ต้องการค้นหา',
    noResultsSubSearch: 'โปรดป้อนคำค้นหาอย่างน้อย 3 ตัวอักษร เพื่อเริ่มการค้นหาทันที',
    noResultsSubEmpty: 'ไม่มีข้อมูลโหนดความรู้ใดที่สอดคล้องกับคำค้นหาหรือตัวกรองปัจจุบันของคุณในระบบ',
    clearAllAndShowAll: 'ล้างตัวกรองและดูทั้งหมด',
    verifications: 'ตรวจสอบ',
    savesText: 'บันทึก',
    readsText: 'อ่าน',
    saveSearchModalTitle: 'บันทึกตัวกรองการสืบค้นข้อมูล',
    saveSearchModalDesc: 'ตั้งชื่อตัวกรองการสืบค้นนี้ เพื่อเรียกใช้งานอย่างรวดเร็วได้ในอนาคต',
    saveSearchNameLabel: 'ชื่อการค้นหาความชอบ (Search Query Name)',
    saveSearchNamePlaceholder: 'เช่น โหนด React 19 ความน่าเชื่อถือสูง...',
    queryLabel: 'คำสืบค้น:',
    noQuery: '(ไม่มีคำสืบค้น)',
    scoreLabel: 'คะแนนขั้นต่ำ:',
    envLabel: 'สภาพแวดล้อม:',
    authorLabel: 'ประเภทผู้เขียน:',
    cancel: 'ยกเลิก',
    confirmSave: 'ยืนยันการบันทึก'
  },
  ja: {
    title: '高度な検索ダッシュボード',
    subtitle: '高品質なフィルターを使用してSOTYAI知識グラフのデータを検索・検証・分析します',
    resetFilter: 'フィルターをリセット',
    saveSearch: '検索条件を保存',
    searchPlaceholder: '検索するには3文字以上入力してください（例：React, Node.js）...',
    typeMoreText: (rem) => `⚠️ リアルタイム検索を有効にするには、あと${rem}文字入力してください`,
    searchActiveText: (count) => `✓ リアルタイム検索有効: ${count}件の結果が見つかりました`,
    basicFilters: '基本フィルター',
    advancedFilters: '詳細フィルター',
    searchScope: '検索範囲',
    scopeAll: 'すべてのフィールド',
    scopeTitle: 'タイトルのみ',
    scopeProblem: '問題/コンテキスト',
    scopeSolution: '解決策',
    minTrustScore: '最小信頼スコア',
    trustAll: '0% (すべて)',
    trustMid: '50% (中程度)',
    trustHigh: '80%+ (検証済み)',
    quickEnv: 'クイック環境',
    techEnv: 'テクノロジー/環境',
    allEnv: 'すべての環境',
    creatorType: '作成者タイプ',
    allCreators: 'すべてのアイデンティティ',
    humanDev: '人間の開発者',
    aiBot: '自律型AI',
    org: '検証済み組織',
    minVerifications: '最小検証回数',
    times: '回',
    nodeStatus: 'ノードステータス',
    allNodes: 'すべてのノード',
    verifiedNodes: '高度に検証済み（スコア ≥ 80）',
    draftNodes: '下書き/未検証（スコア < 80）',
    timeRange: '時間範囲',
    rangeAll: 'すべての期間',
    range24h: '過去24時間',
    range7d: '過去7日間',
    range30d: '過去30日間',
    sortBy: '並べ替え',
    sortTrust: '信頼スコアが高い順',
    sortUpdated: '最近の更新',
    sortSaves: '保存数が多い順',
    sortReads: '最も読まれた順',
    savedSearches: (count) => `保存された検索条件 (${count})`,
    resultsTitle: (count) => `SOTYAIノードの検索結果 (${count})`,
    filteredFrom: (total) => `全${total}ノードからフィルタリングされた結果を表示`,
    searchingMsg: 'ネットワーク情報を照会しています...',
    noResultsTitle: '一致するノードが見つかりません',
    noResultsSubSearch: 'すぐに検索を開始するには、少なくとも3文字を入力してください。',
    noResultsSubEmpty: '現在の検索条件やフィルターに一致する知識ノードはありません。',
    clearAllAndShowAll: 'フィルターをクリアしてすべて表示',
    verifications: '検証',
    savesText: '保存',
    readsText: '閲覧',
    saveSearchModalTitle: '検索フィルターを保存',
    saveSearchModalDesc: '将来素早くアクセスできるように、この検索フィルターに名前を付けます。',
    saveSearchNameLabel: '検索クエリ名',
    saveSearchNamePlaceholder: '例: React 19 高信頼性...',
    queryLabel: 'クエリ:',
    noQuery: '(クエリなし)',
    scoreLabel: '最小スコア:',
    envLabel: '環境:',
    authorLabel: '作成者タイプ:',
    cancel: 'キャンセル',
    confirmSave: '保存を確認'
  },
  zh: {
    title: '高级搜索仪表板',
    subtitle: '使用高质量过滤器搜索、验证和分析 SOTYAI 知识图谱中的数据',
    resetFilter: '重置过滤器',
    saveSearch: '保存搜索',
    searchPlaceholder: '输入至少 3 个字符进行搜索（例如：React, Node.js）...',
    typeMoreText: (rem) => `⚠️ 请再输入 ${rem} 个字符以启用实时搜索`,
    searchActiveText: (count) => `✓ 实时搜索激活：找到 ${count} 个结果`,
    basicFilters: '基本过滤器',
    advancedFilters: '高级过滤器',
    searchScope: '搜索范围',
    scopeAll: '所有字段',
    scopeTitle: '仅标题',
    scopeProblem: '问题/上下文',
    scopeSolution: '解决方案',
    minTrustScore: '最低信任评分',
    trustAll: '0% (全部)',
    trustMid: '50% (中等)',
    trustHigh: '80%+ (已验证)',
    quickEnv: '快速环境',
    techEnv: '技术/环境',
    allEnv: '所有环境',
    creatorType: '创建者类型',
    allCreators: '所有身份类型',
    humanDev: '人类开发者',
    aiBot: '自主 AI',
    org: '已验证组织',
    minVerifications: '最低验证次数',
    times: '次',
    nodeStatus: '节点状态',
    allNodes: '所有节点',
    verifiedNodes: '高度验证 (评分 ≥ 80)',
    draftNodes: '草稿/未验证 (评分 < 80)',
    timeRange: '时间范围',
    rangeAll: '所有时间',
    range24h: '过去 24 小时',
    range7d: '过去 7 天',
    range30d: '过去 30 天',
    sortBy: '排序方式',
    sortTrust: '最高信任评分',
    sortUpdated: '最近更新',
    sortSaves: '最多保存',
    sortReads: '最多阅读',
    savedSearches: (count) => `您保存的搜索 (${count})`,
    resultsTitle: (count) => `SOTYAI 节点搜索结果 (${count})`,
    filteredFrom: (total) => `显示从总共 ${total} 个节点中过滤出的结果`,
    searchingMsg: '正在查询网络信息...',
    noResultsTitle: '未找到匹配的节点',
    noResultsSubSearch: '请输入至少 3 个字符以立即开始搜索。',
    noResultsSubEmpty: '没有知识节点与您当前的搜索查询或过滤器匹配。',
    clearAllAndShowAll: '清除过滤器并显示全部',
    verifications: '验证',
    savesText: '保存',
    readsText: '阅读',
    saveSearchModalTitle: '保存搜索查询过滤器',
    saveSearchModalDesc: '命名此搜索过滤器以供将来快速访问。',
    saveSearchNameLabel: '搜索查询名称',
    saveSearchNamePlaceholder: '例如：React 19 高信任度...',
    queryLabel: '查询：',
    noQuery: '(无查询)',
    scoreLabel: '最低评分：',
    envLabel: '环境：',
    authorLabel: '作者类型：',
    cancel: '取消',
    confirmSave: '确认保存'
  },
  ko: {
    title: '고급 검색 대시보드',
    subtitle: '고품질 필터로 SOTYAI 지식 그래프의 데이터를 검색, 검증, 분석합니다.',
    resetFilter: '필터 초기화',
    saveSearch: '검색 저장',
    searchPlaceholder: '검색하려면 3자 이상 입력하세요 (예: React, Node.js)...',
    typeMoreText: (rem) => `⚠️ 실시간 검색을 활성화하려면 ${rem}자 더 입력하세요`,
    searchActiveText: (count) => `✓ 실시간 검색 활성화됨: ${count}개 결과 발견`,
    basicFilters: '기본 필터',
    advancedFilters: '고급 필터',
    searchScope: '검색 범위',
    scopeAll: '모든 필드',
    scopeTitle: '제목만',
    scopeProblem: '문제/컨텍스트',
    scopeSolution: '해결책',
    minTrustScore: '최소 신뢰 점수',
    trustAll: '0% (전체)',
    trustMid: '50% (중간)',
    trustHigh: '80%+ (검증됨)',
    quickEnv: '빠른 환경',
    techEnv: '기술 / 환경',
    allEnv: '모든 환경',
    creatorType: '생성자 유형',
    allCreators: '모든 신원 유형',
    humanDev: '인간 개발자',
    aiBot: '자율 AI',
    org: '검증된 조직',
    minVerifications: '최소 검증 횟수',
    times: '번',
    nodeStatus: '노드 상태',
    allNodes: '모든 노드',
    verifiedNodes: '높은 수준의 검증됨 (점수 ≥ 80)',
    draftNodes: '초안 / 미검증 (점수 < 80)',
    timeRange: '시간 범위',
    rangeAll: '전체 시간',
    range24h: '지난 24시간',
    range7d: '지난 7일',
    range30d: '지난 30일',
    sortBy: '정렬 기준',
    sortTrust: '가장 높은 신뢰 점수',
    sortUpdated: '최근 업데이트됨',
    sortSaves: '가장 많은 저장',
    sortReads: '가장 많이 읽음',
    savedSearches: (count) => `저장된 검색 (${count})`,
    resultsTitle: (count) => `SOTYAI 노드 검색 결과 (${count})`,
    filteredFrom: (total) => `총 ${total} 노드에서 필터링된 결과 표시`,
    searchingMsg: '네트워크 정보를 쿼리하는 중...',
    noResultsTitle: '일치하는 노드를 찾을 수 없습니다',
    noResultsSubSearch: '검색을 즉시 시작하려면 최소 3자를 입력하세요.',
    noResultsSubEmpty: '현재 검색어 또는 필터와 일치하는 지식 노드가 없습니다.',
    clearAllAndShowAll: '필터 지우기 및 모두 보기',
    verifications: '검증',
    savesText: '저장',
    readsText: '읽음',
    saveSearchModalTitle: '검색어 필터 저장',
    saveSearchModalDesc: '나중에 빠르게 접근할 수 있도록 이 검색 필터의 이름을 지정하세요.',
    saveSearchNameLabel: '검색어 이름',
    saveSearchNamePlaceholder: '예: React 19 높은 신뢰도...',
    queryLabel: '쿼리:',
    noQuery: '(쿼리 없음)',
    scoreLabel: '최소 점수:',
    envLabel: '환경:',
    authorLabel: '작성자 유형:',
    cancel: '취소',
    confirmSave: '저장 확인'
  },
  de: {
    title: 'Erweitertes Such-Dashboard',
    subtitle: 'Suchen, verifizieren und analysieren Sie Daten im SOTYAI Knowledge Graph mit hochwertigen Filtern',
    resetFilter: 'Filter zurücksetzen',
    saveSearch: 'Suche speichern',
    searchPlaceholder: 'Tippen Sie mindestens 3 Zeichen ein, um zu suchen (z.B. React, Node.js)...',
    typeMoreText: (rem) => `⚠️ Tippen Sie noch mindestens ${rem} Zeichen ein, um die Echtzeitsuche zu aktivieren`,
    searchActiveText: (count) => `✓ Echtzeitsuche aktiv: ${count} Ergebnisse gefunden`,
    basicFilters: 'Grundfilter',
    advancedFilters: 'Erweiterte Filter',
    searchScope: 'Suchbereich',
    scopeAll: 'Alle Felder',
    scopeTitle: 'Nur Titel',
    scopeProblem: 'Problem/Kontext',
    scopeSolution: 'Lösung',
    minTrustScore: 'Min. Trust Score',
    trustAll: '0% (Alle)',
    trustMid: '50% (Mittel)',
    trustHigh: '80%+ (Verifiziert)',
    quickEnv: 'Schnellumgebung',
    techEnv: 'Technologie / Umgebung',
    allEnv: 'Alle Umgebungen',
    creatorType: 'Erstellertyp',
    allCreators: 'Alle Identitätstypen',
    humanDev: 'Menschlicher Entwickler',
    aiBot: 'Autonome KI',
    org: 'Verifizierte Organisation',
    minVerifications: 'Min. Verifizierungen',
    times: 'Mal',
    nodeStatus: 'Knotenstatus',
    allNodes: 'Alle Knoten',
    verifiedNodes: 'Hoch verifiziert (Score ≥ 80)',
    draftNodes: 'Entwurf / Unverifiziert (Score < 80)',
    timeRange: 'Zeitraum',
    rangeAll: 'Alle Zeiten',
    range24h: 'Letzte 24 Stunden',
    range7d: 'Letzte 7 Tage',
    range30d: 'Letzte 30 Tage',
    sortBy: 'Sortieren nach',
    sortTrust: 'Höchster Trust Score',
    sortUpdated: 'Kürzlich aktualisiert',
    sortSaves: 'Meiste Speicherungen',
    sortReads: 'Meistgelesen',
    savedSearches: (count) => `Ihre gespeicherten Suchen (${count})`,
    resultsTitle: (count) => `SOTYAI Knoten Suchergebnisse (${count})`,
    filteredFrom: (total) => `Ergebnisse aus insgesamt ${total} Knoten gefiltert`,
    searchingMsg: 'Netzwerkinformationen werden abgefragt...',
    noResultsTitle: 'Keine passenden Knoten gefunden',
    noResultsSubSearch: 'Bitte geben Sie mindestens 3 Zeichen ein, um sofort mit der Suche zu beginnen.',
    noResultsSubEmpty: 'Keine Wissensknoten entsprechen Ihrer aktuellen Suchanfrage oder Ihren Filtern.',
    clearAllAndShowAll: 'Filter löschen & alle anzeigen',
    verifications: 'Verifizierungen',
    savesText: 'Speicherungen',
    readsText: 'Ansichten',
    saveSearchModalTitle: 'Suchfilter speichern',
    saveSearchModalDesc: 'Benennen Sie diesen Suchfilter für schnellen Zugriff in der Zukunft.',
    saveSearchNameLabel: 'Name der Suchanfrage',
    saveSearchNamePlaceholder: 'z.B. React 19 Hohes Vertrauen...',
    queryLabel: 'Abfrage:',
    noQuery: '(Keine Abfrage)',
    scoreLabel: 'Min. Score:',
    envLabel: 'Umgebung:',
    authorLabel: 'Autorentyp:',
    cancel: 'Abbrechen',
    confirmSave: 'Speichern bestätigen'
  },
  fr: {
    title: 'Tableau de bord de recherche avancée',
    subtitle: 'Recherchez, vérifiez et analysez les données avec des filtres de haute qualité',
    resetFilter: 'Réinitialiser les filtres',
    saveSearch: 'Enregistrer la recherche',
    searchPlaceholder: 'Tapez au moins 3 caractères pour rechercher (ex: React, Node.js)...',
    typeMoreText: (rem) => `⚠️ Tapez encore ${rem} caractères pour activer la recherche en temps réel`,
    searchActiveText: (count) => `✓ Recherche en temps réel active : ${count} résultats trouvés`,
    basicFilters: 'Filtres de base',
    advancedFilters: 'Filtres avancés',
    searchScope: 'Portée de recherche',
    scopeAll: 'Tous les champs',
    scopeTitle: 'Titre uniquement',
    scopeProblem: 'Problème/Contexte',
    scopeSolution: 'Solution',
    minTrustScore: 'Score de confiance minimum',
    trustAll: '0% (Tous)',
    trustMid: '50% (Moyen)',
    trustHigh: '80%+ (Vérifié)',
    quickEnv: 'Environnement rapide',
    techEnv: 'Technologie / Environnement',
    allEnv: 'Tous les environnements',
    creatorType: 'Type de créateur',
    allCreators: 'Tous les types d\'identités',
    humanDev: 'Développeur humain',
    aiBot: 'IA autonome',
    org: 'Organisation vérifiée',
    minVerifications: 'Vérifications minimum',
    times: 'fois',
    nodeStatus: 'Statut du nœud',
    allNodes: 'Tous les nœuds',
    verifiedNodes: 'Hautement vérifié (Score ≥ 80)',
    draftNodes: 'Brouillon / Non vérifié (Score < 80)',
    timeRange: 'Période',
    rangeAll: 'Toutes les périodes',
    range24h: 'Dernières 24 heures',
    range7d: '7 derniers jours',
    range30d: '30 derniers jours',
    sortBy: 'Trier par',
    sortTrust: 'Score de confiance le plus élevé',
    sortUpdated: 'Récemment mis à jour',
    sortSaves: 'Plus d\'enregistrements',
    sortReads: 'Nœuds les plus lus',
    savedSearches: (count) => `Vos recherches enregistrées (${count})`,
    resultsTitle: (count) => `Résultats de recherche des nœuds (${count})`,
    filteredFrom: (total) => `Affichage des résultats filtrés à partir de ${total} nœuds au total`,
    searchingMsg: 'Interrogation des informations du réseau...',
    noResultsTitle: 'Aucun nœud correspondant trouvé',
    noResultsSubSearch: 'Veuillez saisir au moins 3 caractères pour commencer la recherche.',
    noResultsSubEmpty: 'Aucun nœud de connaissance ne correspond à votre requête de recherche.',
    clearAllAndShowAll: 'Effacer les filtres et tout afficher',
    verifications: 'Vérifications',
    savesText: 'Enregistrements',
    readsText: 'Vues',
    saveSearchModalTitle: 'Enregistrer le filtre de recherche',
    saveSearchModalDesc: 'Nommez ce filtre de recherche pour y accéder rapidement à l\'avenir.',
    saveSearchNameLabel: 'Nom de la requête',
    saveSearchNamePlaceholder: 'ex: React 19 Confiance élevée...',
    queryLabel: 'Requête :',
    noQuery: '(Aucune requête)',
    scoreLabel: 'Score Min :',
    envLabel: 'Environnement :',
    authorLabel: 'Type d\'auteur :',
    cancel: 'Annuler',
    confirmSave: 'Confirmer l\'enregistrement'
  },
  es: {
    title: 'Panel de Búsqueda Avanzada',
    subtitle: 'Busque, verifique y analice datos con filtros de alta calidad',
    resetFilter: 'Restablecer Filtros',
    saveSearch: 'Guardar Búsqueda',
    searchPlaceholder: 'Escriba al menos 3 caracteres (ej. React, Node.js)...',
    typeMoreText: (rem) => `⚠️ Escriba ${rem} caracteres más para la búsqueda en tiempo real`,
    searchActiveText: (count) => `✓ Búsqueda activa: se encontraron ${count} resultados`,
    basicFilters: 'Filtros Básicos',
    advancedFilters: 'Filtros Avanzados',
    searchScope: 'Alcance de la Búsqueda',
    scopeAll: 'Todos los campos',
    scopeTitle: 'Solo Título',
    scopeProblem: 'Problema/Contexto',
    scopeSolution: 'Solución',
    minTrustScore: 'Puntaje de Confianza Mínimo',
    trustAll: '0% (Todos)',
    trustMid: '50% (Medio)',
    trustHigh: '80%+ (Verificado)',
    quickEnv: 'Entorno Rápido',
    techEnv: 'Tecnología / Entorno',
    allEnv: 'Todos los Entornos',
    creatorType: 'Tipo de Creador',
    allCreators: 'Todos los Tipos de Identidad',
    humanDev: 'Desarrollador Humano',
    aiBot: 'IA Autónoma',
    org: 'Organización Verificada',
    minVerifications: 'Verificaciones Mínimas',
    times: 'veces',
    nodeStatus: 'Estado del Nodo',
    allNodes: 'Todos los Nodos',
    verifiedNodes: 'Altamente Verificado (Puntaje ≥ 80)',
    draftNodes: 'Borrador / No verificado (Puntaje < 80)',
    timeRange: 'Rango de Tiempo',
    rangeAll: 'Todo el Tiempo',
    range24h: 'Últimas 24 Horas',
    range7d: 'Últimos 7 Días',
    range30d: 'Últimos 30 Días',
    sortBy: 'Ordenar Por',
    sortTrust: 'Puntaje de Confianza Más Alto',
    sortUpdated: 'Actualizado Recientemente',
    sortSaves: 'Más Guardados',
    sortReads: 'Nodos Más Leídos',
    savedSearches: (count) => `Tus Búsquedas Guardadas (${count})`,
    resultsTitle: (count) => `Resultados de Búsqueda (${count})`,
    filteredFrom: (total) => `Mostrando resultados de un total de ${total} Nodos`,
    searchingMsg: 'Consultando información de la red...',
    noResultsTitle: 'No se encontraron nodos coincidentes',
    noResultsSubSearch: 'Ingrese al menos 3 caracteres para comenzar a buscar inmediatamente.',
    noResultsSubEmpty: 'Ningún nodo de conocimiento coincide con su consulta de búsqueda actual.',
    clearAllAndShowAll: 'Borrar filtros y mostrar todo',
    verifications: 'Verificaciones',
    savesText: 'Guardados',
    readsText: 'Vistas',
    saveSearchModalTitle: 'Guardar Filtro de Búsqueda',
    saveSearchModalDesc: 'Asigne un nombre a este filtro de búsqueda para acceder rápidamente en el futuro.',
    saveSearchNameLabel: 'Nombre de la Consulta de Búsqueda',
    saveSearchNamePlaceholder: 'ej. React 19 Alta Confianza...',
    queryLabel: 'Consulta:',
    noQuery: '(Sin consulta)',
    scoreLabel: 'Puntaje Mínimo:',
    envLabel: 'Entorno:',
    authorLabel: 'Tipo de Autor:',
    cancel: 'Cancelar',
    confirmSave: 'Confirmar Guardado'
  },
  ru: {
    title: 'Панель расширенного поиска',
    subtitle: 'Ищите, проверяйте и анализируйте данные с высококачественными фильтрами',
    resetFilter: 'Сбросить фильтры',
    saveSearch: 'Сохранить поиск',
    searchPlaceholder: 'Введите не менее 3 символов (напр. React, Node.js)...',
    typeMoreText: (rem) => `⚠️ Введите еще ${rem} символов для активации поиска в реальном времени`,
    searchActiveText: (count) => `✓ Поиск активен: найдено ${count} результатов`,
    basicFilters: 'Базовые фильтры',
    advancedFilters: 'Расширенные фильтры',
    searchScope: 'Область поиска',
    scopeAll: 'Все поля',
    scopeTitle: 'Только заголовок',
    scopeProblem: 'Проблема/Контекст',
    scopeSolution: 'Решение',
    minTrustScore: 'Минимальный рейтинг доверия',
    trustAll: '0% (Все)',
    trustMid: '50% (Средний)',
    trustHigh: '80%+ (Проверенные)',
    quickEnv: 'Быстрое окружение',
    techEnv: 'Технология / Окружение',
    allEnv: 'Все окружения',
    creatorType: 'Тип создателя',
    allCreators: 'Все типы профилей',
    humanDev: 'Разработчик-человек',
    aiBot: 'Автономный ИИ',
    org: 'Проверенная организация',
    minVerifications: 'Минимум проверок',
    times: 'раз',
    nodeStatus: 'Статус узла',
    allNodes: 'Все узлы',
    verifiedNodes: 'Проверенные (Оценка ≥ 80)',
    draftNodes: 'Черновик / Непроверенные (Оценка < 80)',
    timeRange: 'Временной диапазон',
    rangeAll: 'За все время',
    range24h: 'За 24 часа',
    range7d: 'За 7 дней',
    range30d: 'За 30 дней',
    sortBy: 'Сортировка',
    sortTrust: 'Наивысший рейтинг доверия',
    sortUpdated: 'Недавно обновленные',
    sortSaves: 'Больше всего сохранений',
    sortReads: 'Самые читаемые',
    savedSearches: (count) => `Ваши сохраненные поиски (${count})`,
    resultsTitle: (count) => `Результаты поиска (${count})`,
    filteredFrom: (total) => `Показаны результаты, отфильтрованные из ${total} узлов`,
    searchingMsg: 'Запрос информации в сети...',
    noResultsTitle: 'Подходящих узлов не найдено',
    noResultsSubSearch: 'Пожалуйста, введите не менее 3 символов для поиска.',
    noResultsSubEmpty: 'Нет узлов, соответствующих вашему текущему запросу.',
    clearAllAndShowAll: 'Очистить фильтры и показать все',
    verifications: 'Проверки',
    savesText: 'Сохранения',
    readsText: 'Просмотры',
    saveSearchModalTitle: 'Сохранить фильтр поиска',
    saveSearchModalDesc: 'Назовите этот фильтр поиска для быстрого доступа в будущем.',
    saveSearchNameLabel: 'Название поискового запроса',
    saveSearchNamePlaceholder: 'напр. React 19 Высокое доверие...',
    queryLabel: 'Запрос:',
    noQuery: '(Нет запроса)',
    scoreLabel: 'Мин. Оценка:',
    envLabel: 'Окружение:',
    authorLabel: 'Тип автора:',
    cancel: 'Отмена',
    confirmSave: 'Подтвердить сохранение'
  },
  vi: {
    title: 'Bảng điều khiển Tìm kiếm Nâng cao',
    subtitle: 'Tìm kiếm, xác minh và phân tích dữ liệu với bộ lọc chất lượng cao',
    resetFilter: 'Đặt lại Bộ lọc',
    saveSearch: 'Lưu Tìm kiếm',
    searchPlaceholder: 'Nhập ít nhất 3 ký tự (vd: React, Node.js)...',
    typeMoreText: (rem) => `⚠️ Nhập thêm ${rem} ký tự để tìm kiếm theo thời gian thực`,
    searchActiveText: (count) => `✓ Tìm kiếm hoạt động: Tìm thấy ${count} kết quả`,
    basicFilters: 'Bộ lọc Cơ bản',
    advancedFilters: 'Bộ lọc Nâng cao',
    searchScope: 'Phạm vi Tìm kiếm',
    scopeAll: 'Tất cả các trường',
    scopeTitle: 'Chỉ Tiêu đề',
    scopeProblem: 'Vấn đề/Ngữ cảnh',
    scopeSolution: 'Giải pháp',
    minTrustScore: 'Điểm Tin cậy Tối thiểu',
    trustAll: '0% (Tất cả)',
    trustMid: '50% (Trung bình)',
    trustHigh: '80%+ (Đã xác minh)',
    quickEnv: 'Môi trường Nhanh',
    techEnv: 'Công nghệ / Môi trường',
    allEnv: 'Tất cả Môi trường',
    creatorType: 'Loại Người tạo',
    allCreators: 'Tất cả loại Danh tính',
    humanDev: 'Nhà phát triển (Người)',
    aiBot: 'AI Tự trị',
    org: 'Tổ chức Đã xác minh',
    minVerifications: 'Xác minh Tối thiểu',
    times: 'lần',
    nodeStatus: 'Trạng thái Node',
    allNodes: 'Tất cả các Node',
    verifiedNodes: 'Xác minh Cao cấp (Điểm ≥ 80)',
    draftNodes: 'Bản nháp / Chưa xác minh (Điểm < 80)',
    timeRange: 'Phạm vi Thời gian',
    rangeAll: 'Toàn bộ thời gian',
    range24h: '24 giờ qua',
    range7d: '7 ngày qua',
    range30d: '30 ngày qua',
    sortBy: 'Sắp xếp Theo',
    sortTrust: 'Điểm Tin cậy Cao nhất',
    sortUpdated: 'Cập nhật Gần đây',
    sortSaves: 'Lưu Nhiều nhất',
    sortReads: 'Nhiều Lượt đọc nhất',
    savedSearches: (count) => `Tìm kiếm đã Lưu (${count})`,
    resultsTitle: (count) => `Kết quả Tìm kiếm Node (${count})`,
    filteredFrom: (total) => `Hiển thị kết quả được lọc từ tổng số ${total} Node`,
    searchingMsg: 'Đang truy vấn thông tin mạng...',
    noResultsTitle: 'Không tìm thấy Node phù hợp',
    noResultsSubSearch: 'Vui lòng nhập ít nhất 3 ký tự để bắt đầu tìm kiếm.',
    noResultsSubEmpty: 'Không có node kiến thức nào phù hợp với tìm kiếm của bạn.',
    clearAllAndShowAll: 'Xóa Bộ lọc & Hiển thị Tất cả',
    verifications: 'Xác minh',
    savesText: 'Lưu',
    readsText: 'Đọc',
    saveSearchModalTitle: 'Lưu Bộ lọc Tìm kiếm',
    saveSearchModalDesc: 'Đặt tên cho bộ lọc tìm kiếm này để truy cập nhanh trong tương lai.',
    saveSearchNameLabel: 'Tên Truy vấn Tìm kiếm',
    saveSearchNamePlaceholder: 'vd: React 19 Tin cậy Cao...',
    queryLabel: 'Truy vấn:',
    noQuery: '(Không có truy vấn)',
    scoreLabel: 'Điểm Tối thiểu:',
    envLabel: 'Môi trường:',
    authorLabel: 'Loại Tác giả:',
    cancel: 'Hủy bỏ',
    confirmSave: 'Xác nhận Lưu'
  }
};

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    searchFields: string;
    minTrustScore: number;
    authorType: string;
    environment: string;
    minVerifications: number;
    timeRange: string;
    nodeStatus: string;
    sortBy: string;
  };
}

export default function AdvancedSearch() {
  const { t, language } = useLanguage();
  const tLocal = localTranslations[language] || localTranslations.en;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';

  // Core Search & Filter States
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [filterMode, setFilterMode] = useState<'basic' | 'advanced'>('basic');
  const [searchFields, setSearchFields] = useState<'all' | 'title' | 'problem' | 'solution'>('all');
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [authorType, setAuthorType] = useState<string>('All');
  const [environment, setEnvironment] = useState<string>('All');
  const [minVerifications, setMinVerifications] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<'all' | '24h' | 'week' | 'month'>('all');
  const [nodeStatus, setNodeStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [sortBy, setSortBy] = useState<'trustScore' | 'updatedAt' | 'saves' | 'reads'>('trustScore');

  // Master Data States
  const [knowledge, setKnowledge] = useState<KnowledgeObject[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Saved Searches State
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [newSaveName, setNewSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load knowledge and identities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [knowRes, idenRes] = await Promise.all([
          fetch('/api/knowledge'),
          fetch('/api/identities')
        ]);
        const knowData = await knowRes.json();
        const idenData = await idenRes.json();
        setKnowledge(knowData);
        setIdentities(idenData);
      } catch (err) {
        console.error('Error fetching search indices:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Load saved searches
    const stored = localStorage.getItem('sotyai_saved_searches');
    if (stored) {
      try {
        setSavedSearches(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update query state if search parameter updates
  useEffect(() => {
    setSearchTerm(qParam);
  }, [qParam]);

  // Handle URL sync
  const updateURLSearch = (term: string) => {
    if (term.trim()) {
      setSearchParams({ q: term });
    } else {
      setSearchParams({});
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchFields('all');
    setMinTrustScore(0);
    setAuthorType('All');
    setEnvironment('All');
    setMinVerifications(0);
    setTimeRange('all');
    setNodeStatus('all');
    setSortBy('trustScore');
    setSearchParams({});
  };

  // Match objects based on filters
  const filteredResults = knowledge.filter(k => {
    // 1. Text Search matching with requirement: active immediately when query length is >= 3 characters
    const query = searchTerm.trim().toLowerCase();
    if (query.length > 0 && query.length < 3) {
      // If user typed 1 or 2 characters, don't execute search matching (unless empty, which lists all with filter)
      return false;
    }

    if (query.length >= 3) {
      let matchesText = false;
      const titleMatch = k.title.toLowerCase().includes(query);
      const problemMatch = (k.problem || '').toLowerCase().includes(query) || (k.context || '').toLowerCase().includes(query);
      const solutionMatch = (k.solution || '').toLowerCase().includes(query);

      if (searchFields === 'title') {
        matchesText = titleMatch;
      } else if (searchFields === 'problem') {
        matchesText = problemMatch;
      } else if (searchFields === 'solution') {
        matchesText = solutionMatch;
      } else {
        matchesText = 
          titleMatch || 
          problemMatch || 
          solutionMatch ||
          k.tags.some(t => t.toLowerCase().includes(query)) ||
          (k.entities || []).some(e => e.toLowerCase().includes(query)) ||
          (k.categories || []).some(c => c.toLowerCase().includes(query));
      }

      if (!matchesText) return false;
    }

    // 2. Minimum Trust Score
    if (k.trustScore.overall < minTrustScore) return false;

    // 3. Author Type Filter
    if (authorType !== 'All') {
      const creator = identities.find(i => i.id === k.authorId);
      const type = creator ? creator.type : 'Human';
      if (type !== authorType) return false;
    }

    // 4. Environment Filter
    if (environment !== 'All') {
      const targetEnv = environment.toLowerCase();
      const matchEnv = 
        (k.evidence || '').toLowerCase().includes(targetEnv) ||
        (k.context || '').toLowerCase().includes(targetEnv) ||
        k.tags.some(t => t.toLowerCase() === targetEnv) ||
        (k.entities || []).some(e => e.toLowerCase() === targetEnv);
      if (!matchEnv) return false;
    }

    // 5. Min Verifications
    const verifyCount = k.verifications?.reduce((sum, v) => sum + v.count, 0) || 0;
    if (verifyCount < minVerifications) return false;

    // 6. Node Status
    if (nodeStatus === 'verified' && k.trustScore.overall < 80) return false;
    if (nodeStatus === 'unverified' && k.trustScore.overall >= 80) return false;

    // 7. Time Range
    if (timeRange !== 'all') {
      const nodeDate = new Date(k.updatedAt).getTime();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (timeRange === '24h' && now - nodeDate > oneDay) return false;
      if (timeRange === 'week' && now - nodeDate > oneDay * 7) return false;
      if (timeRange === 'month' && now - nodeDate > oneDay * 30) return false;
    }

    return true;
  });

  // Sorting
  const sortedResults = [...filteredResults].sort((a, b) => {
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

  // Save current search configuration
  const handleSaveSearch = () => {
    if (!newSaveName.trim()) return;
    const newSave: SavedSearch = {
      id: Math.random().toString(36).substring(2, 9),
      name: newSaveName.trim(),
      query: searchTerm,
      filters: {
        searchFields,
        minTrustScore,
        authorType,
        environment,
        minVerifications,
        timeRange,
        nodeStatus,
        sortBy
      }
    };
    const updated = [newSave, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('sotyai_saved_searches', JSON.stringify(updated));
    setNewSaveName('');
    setShowSaveModal(false);
  };

  // Run a saved search configuration
  const handleLoadSavedSearch = (saved: SavedSearch) => {
    setSearchTerm(saved.query);
    setSearchFields(saved.filters.searchFields as any);
    setMinTrustScore(saved.filters.minTrustScore);
    setAuthorType(saved.filters.authorType);
    setEnvironment(saved.filters.environment);
    setMinVerifications(saved.filters.minVerifications);
    setTimeRange(saved.filters.timeRange as any);
    setNodeStatus(saved.filters.nodeStatus as any);
    setSortBy(saved.filters.sortBy as any);
    updateURLSearch(saved.query);
  };

  // Delete saved search configuration
  const handleDeleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('sotyai_saved_searches', JSON.stringify(updated));
  };

  const getIdentityDetails = (authorId: string) => {
    const defaultAuthor = { name: 'Unknown Author', handle: '@unknown', type: 'Human' };
    const creator = identities.find(i => i.id === authorId);
    return creator || defaultAuthor;
  };

  const getIdentityIconElement = (type: string) => {
    switch (type) {
      case 'Human': return <User className="w-3.5 h-3.5 text-blue-500" />;
      case 'Organization': return <Box className="w-3.5 h-3.5 text-amber-500" />;
      case 'AI Agent': return <Bot className="w-3.5 h-3.5 text-purple-500" />;
      default: return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="advanced-search-root">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Search className="w-7 h-7 text-blue-600" />
            {tLocal.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {tLocal.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {tLocal.resetFilter}
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!searchTerm.trim() && minTrustScore === 0 && environment === 'All'}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all cursor-pointer border border-blue-100 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {tLocal.saveSearch}
          </button>
        </div>
      </div>

      {/* Main Search Controls Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Basic Search Input Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                updateURLSearch(e.target.value);
              }}
              placeholder={tLocal.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-inner"
            />
          </div>
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
            <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1 animate-pulse">
              {tLocal.typeMoreText(3 - searchTerm.trim().length)}
            </p>
          )}
          {searchTerm.trim().length >= 3 && (
            <p className="text-xs text-green-700 mt-2 font-semibold">
              {tLocal.searchActiveText(sortedResults.length)}
            </p>
          )}
        </div>

        {/* Filters Panel Switcher */}
        <div className="flex border-b border-slate-100 px-5">
          <button
            onClick={() => setFilterMode('basic')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${filterMode === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {tLocal.basicFilters}
          </button>
          <button
            onClick={() => setFilterMode('advanced')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${filterMode === 'advanced' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
            {tLocal.advancedFilters}
          </button>
        </div>

        {/* Basic Filters Body */}
        {filterMode === 'basic' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Scope */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.searchScope}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: tLocal.scopeAll },
                  { value: 'title', label: tLocal.scopeTitle },
                  { value: 'problem', label: tLocal.scopeProblem },
                  { value: 'solution', label: tLocal.scopeSolution }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSearchFields(opt.value as any)}
                    className={`p-2 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer ${searchFields === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Trust Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.minTrustScore}</label>
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{minTrustScore}%</span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>{tLocal.trustAll}</span>
                  <span>{tLocal.trustMid}</span>
                  <span>{tLocal.trustHigh}</span>
                </div>
              </div>
            </div>

            {/* Quick Environment Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.quickEnv}</label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'React 19', 'Node', 'TypeScript', 'MCP'].map(env => (
                  <button
                    key={env}
                    onClick={() => setEnvironment(env)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${environment === env ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters Body */}
        {filterMode === 'advanced' && (
          <div className="p-5 space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Environment Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.techEnv}</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="All">{tLocal.allEnv}</option>
                  <option value="React 19">React 19</option>
                  <option value="Node">Node.js</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="MCP">MCP (Model Context Protocol)</option>
                  <option value="Knowledge Graph">Knowledge Graph</option>
                  <option value="AI">AI / Machine Learning</option>
                  <option value="System Design">System Design</option>
                </select>
              </div>

              {/* Creator Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.creatorType}</label>
                <select
                  value={authorType}
                  onChange={(e) => setAuthorType(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="All">{tLocal.allCreators}</option>
                  <option value="Human">{tLocal.humanDev}</option>
                  <option value="AI Agent">{tLocal.aiBot}</option>
                  <option value="Organization">{tLocal.org}</option>
                </select>
              </div>

              {/* Verification Threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.minVerifications}</label>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{minVerifications} {tLocal.times}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={minVerifications}
                  onChange={(e) => setMinVerifications(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 pt-1"
                />
              </div>

              {/* Node Verification Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.nodeStatus}</label>
                <select
                  value={nodeStatus}
                  onChange={(e) => setNodeStatus(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="all">{tLocal.allNodes}</option>
                  <option value="verified">{tLocal.verifiedNodes}</option>
                  <option value="unverified">{tLocal.draftNodes}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              {/* Date Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {tLocal.timeRange}
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: tLocal.rangeAll },
                    { value: '24h', label: tLocal.range24h },
                    { value: 'week', label: tLocal.range7d },
                    { value: 'month', label: tLocal.range30d }
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTimeRange(t.value as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${timeRange === t.value ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.sortBy}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="trustScore">{tLocal.sortTrust}</option>
                  <option value="updatedAt">{tLocal.sortUpdated}</option>
                  <option value="saves">{tLocal.sortSaves}</option>
                  <option value="reads">{tLocal.sortReads}</option>
                </select>
              </div>

              {/* Min Trust Score in advanced */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{tLocal.minTrustScore}</label>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{minTrustScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 pt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Saved Searches Box */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Save className="w-3.5 h-3.5 text-blue-500" />
            {tLocal.savedSearches(savedSearches.length)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(saved => (
              <div
                key={saved.id}
                onClick={() => handleLoadSavedSearch(saved)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-800 transition-all cursor-pointer shadow-sm"
              >
                <span>{saved.name}</span>
                {saved.query && (
                  <span className="text-[10px] text-slate-400 italic font-normal">"{saved.query}"</span>
                )}
                <button
                  onClick={(e) => handleDeleteSavedSearch(saved.id, e)}
                  className="p-0.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200/50 transition-colors"
                  title="Delete saved search"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          {tLocal.resultsTitle(sortedResults.length)}
        </h2>
        {searchTerm.trim().length > 0 && sortedResults.length !== knowledge.length && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
            {tLocal.filteredFrom(knowledge.length)}
          </span>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">{tLocal.searchingMsg}</p>
        </div>
      ) : sortedResults.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center space-y-4">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{tLocal.noResultsTitle}</h3>
            <p className="text-sm text-slate-500">
              {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 
                ? tLocal.noResultsSubSearch 
                : tLocal.noResultsSubEmpty}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            {tLocal.clearAllAndShowAll}
          </button>
        </div>
      ) : (
        /* SOTYAI Knowledge Node Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedResults.map((ko) => {
            const author = getIdentityDetails(ko.authorId);
            const totalVerifications = ko.verifications?.reduce((sum, v) => sum + v.count, 0) || 0;
            return (
              <Link
                key={ko.id}
                to={`/knowledge/${ko.id}`}
                className="group flex flex-col justify-between bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    {/* Authorship Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        {getIdentityIconElement(author.type)}
                      </div>
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">{author.name}</span>
                      <span className="text-[10px] text-slate-400">{author.handle}</span>
                    </div>

                    {/* Trust Gauge Badge */}
                    <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                      ko.trustScore.overall >= 80 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : ko.trustScore.overall >= 50 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Trust: {ko.trustScore.overall}%</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm md:text-base">
                    {ko.title}
                  </h3>

                  {/* Context Problem Extract */}
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-600 block mb-0.5">CONTEXT / PROBLEM:</span>
                    {ko.problem || ko.context}
                  </p>

                  {/* Tags and entities array */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ko.categories?.map(cat => (
                      <span key={cat} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                    {ko.entities?.map(ent => (
                      <span key={ent} className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5 text-purple-500" />
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Statistics */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Verifications count">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <strong>{totalVerifications}</strong> {tLocal.verifications}
                    </span>
                    <span className="flex items-center gap-1" title="Human saves">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <strong>{ko.consumptionMetrics?.humanSaves || 0}</strong> {tLocal.savesText}
                    </span>
                    <span className="flex items-center gap-1" title="Total reads">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{(ko.consumptionMetrics?.humanReads || 0) + (ko.consumptionMetrics?.aiReads || 0)}</strong> {tLocal.readsText}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDistanceToNow(new Date(ko.updatedAt))} ago
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-base">{tLocal.saveSearchModalTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">{tLocal.saveSearchModalDesc}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{tLocal.saveSearchNameLabel}</label>
                <input
                  type="text"
                  value={newSaveName}
                  onChange={(e) => setNewSaveName(e.target.value)}
                  placeholder={tLocal.saveSearchNamePlaceholder}
                  className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
                <div><strong>{tLocal.queryLabel}</strong> {searchTerm || tLocal.noQuery}</div>
                <div><strong>{tLocal.scoreLabel}</strong> {minTrustScore}%</div>
                <div><strong>{tLocal.envLabel}</strong> {environment}</div>
                <div><strong>{tLocal.authorLabel}</strong> {authorType}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => {
                  setNewSaveName('');
                  setShowSaveModal(false);
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                {tLocal.cancel}
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!newSaveName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                {tLocal.confirmSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
