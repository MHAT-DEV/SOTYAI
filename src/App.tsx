import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BrainCircuit, Search, ChevronDown, User, Box, Shield, Bot, Plus, Menu, X, Settings, Terminal, Tag, Folder, AlertTriangle, MessageSquare, ArrowRight, BookOpen, CheckCircle2, Bug, Layers, Award, Trophy, Cpu, Code, Globe, Rss, BarChart3 } from 'lucide-react';
import { Identity } from './types';
import { useLanguage } from './context/LanguageContext';
import { SUPPORTED_LANGUAGES } from './lib/translations';
import Feed from './components/Feed';
import KnowledgeDetail from './components/KnowledgeDetail';
import CreateKnowledge from './components/CreateKnowledge';
import IdentityProfile from './components/IdentityProfile';
import AccountSettings from './components/AccountSettings';
import DeveloperPortal from './components/DeveloperPortal';
import Subscriptions from './components/Subscriptions';
import Organizations from './components/Organizations';
import TrustAnalytics from './components/TrustAnalytics';
import TagsExplorer from './components/TagsExplorer';
import ReportsCenter from './components/ReportsCenter';
import FullMessenger from './components/FullMessenger';
import ChatWidget from './components/ChatWidget';
import AdvancedSearch from './components/AdvancedSearch';
import SupportBoard from './components/SupportBoard';
import TrendingArena from './components/TrendingArena';
import ChallengesArena from './components/ChallengesArena';
import TechDomains from './components/TechDomains';
import AboutNetwork from './components/AboutNetwork';


export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t, showPrompt, detectedLang, dismissPrompt, acceptPrompt } = useLanguage();

  const getLinkClass = (path: string) => {
    const isActive = path === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(path);
    
    return `group block px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between transition-all border-l-4 ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-xs'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent hover:border-slate-200'
    }`;
  };
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [currentIdentity, setCurrentIdentity] = useState<Identity | null>(null);
  const [isIdentityMenuOpen, setIsIdentityMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Global Quick Search States
  const [headerQuery, setHeaderQuery] = useState('');
  const [knowledgeIndex, setKnowledgeIndex] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    // Load identities
    fetch('/api/identities')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch identities');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setIdentities(data);
          if (data.length > 0) setCurrentIdentity(data[0]);
        } else {
          console.error('Invalid identities data:', data);
          setIdentities([]);
        }
      })
      .catch(err => {
        console.error('Error fetching identities:', err);
        setIdentities([]);
      });

    // Load knowledge for quick header search index
    fetch('/api/knowledge')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch knowledge');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setKnowledgeIndex(data);
        } else {
          console.error('Invalid knowledge data:', data);
          setKnowledgeIndex([]);
        }
      })
      .catch(err => {
        console.error('Error fetching search index:', err);
        setKnowledgeIndex([]);
      });
  }, []);

  useEffect(() => {
    if (!currentIdentity) return;

    const fetchUnreadCount = () => {
      fetch(`/api/messages/unread-count/${currentIdentity.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch unread count');
          return res.json();
        })
        .then(data => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(err => console.error('Error fetching unread count:', err));
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 4000);
    return () => clearInterval(interval);
  }, [currentIdentity]);

  const getIdentityIcon = (type: string) => {
    switch (type) {
      case 'Human': return <User className="w-4 h-4" />;
      case 'Organization': return <Box className="w-4 h-4" />;
      case 'AI Agent': return <Bot className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="bg-slate-900 text-white p-1.5 rounded-md hidden sm:block">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <Link to="/" className="font-bold text-xl tracking-tight">SOTYAI</Link>
            <span className="hidden md:inline-block ml-4 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              HAKP Network
            </span>
          </div>

          <div className="flex-1 max-w-2xl mx-4 sm:mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  // Small delay to allow clicking on dropdown elements before it dismisses
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/search?q=${encodeURIComponent(headerQuery)}`);
                    setIsSearchFocused(false);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder={t('feed.searchPlaceholder')} 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />

              {/* Quick Search Dropdown / Popover (Only visible if length >= 3) */}
              {isSearchFocused && headerQuery.trim().length >= 3 && (() => {
                const query = headerQuery.trim().toLowerCase();
                const matchingNodes = knowledgeIndex.filter(ko => ko.title.toLowerCase().includes(query) || (ko.problem || '').toLowerCase().includes(query)).slice(0, 4);
                const matchingTags = Array.from(new Set(knowledgeIndex.flatMap(ko => ko.tags || []))).filter(t => t.toLowerCase().includes(query)).slice(0, 3);
                const matchingEntities = Array.from(new Set(knowledgeIndex.flatMap(ko => ko.entities || []))).filter(e => e.toLowerCase().includes(query)).slice(0, 3);
                const matchingCategories = Array.from(new Set(knowledgeIndex.flatMap(ko => ko.categories || []))).filter(c => c.toLowerCase().includes(query)).slice(0, 3);
                const matchingAuthors = identities.filter(i => i.name.toLowerCase().includes(query) || i.handle.toLowerCase().includes(query)).slice(0, 3);

                const hasResults = matchingNodes.length > 0 || matchingTags.length > 0 || matchingEntities.length > 0 || matchingCategories.length > 0 || matchingAuthors.length > 0;

                if (!hasResults) {
                  return (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-center">
                      <p className="text-xs text-slate-500 font-medium">ไม่พบผลลัพธ์การค้นหาด่วนสำหรับ "{headerQuery}"</p>
                      <button
                        onMouseDown={() => {
                          navigate(`/search?q=${encodeURIComponent(headerQuery)}`);
                          setHeaderQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline mt-1.5 block mx-auto cursor-pointer"
                      >
                        ลองใช้ตัวกรองขั้นสูงใน Advanced Search Page
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[480px] overflow-y-auto p-3 space-y-3 text-left">
                    {/* Matching Nodes */}
                    {matchingNodes.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between">
                          <span>KNOWLEDGE NODES ({matchingNodes.length})</span>
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">Real-time</span>
                        </h4>
                        <div className="space-y-1">
                          {matchingNodes.map(node => (
                            <button
                              key={node.id}
                              onMouseDown={() => {
                                navigate(`/knowledge/${node.id}`);
                                setHeaderQuery('');
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                              <span className="truncate flex-1">{node.title}</span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Trust {node.trustScore.overall}%</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Taxonomy */}
                    {(matchingTags.length > 0 || matchingEntities.length > 0 || matchingCategories.length > 0) && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">TAXONOMY & ENTITIES</h4>
                        <div className="flex flex-wrap gap-1.5 p-1">
                          {matchingCategories.map(cat => (
                            <button
                              key={cat}
                              onMouseDown={() => {
                                navigate(`/explore/tags?tab=categories&select=${encodeURIComponent(cat)}`);
                                setHeaderQuery('');
                                setIsSearchFocused(false);
                              }}
                              className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              {cat} (Category)
                            </button>
                          ))}
                          {matchingEntities.map(ent => (
                            <button
                              key={ent}
                              onMouseDown={() => {
                                navigate(`/explore/tags?tab=entities&select=${encodeURIComponent(ent)}`);
                                setHeaderQuery('');
                                setIsSearchFocused(false);
                              }}
                              className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 hover:bg-purple-100 hover:border-purple-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              <Tag className="w-2.5 h-2.5 text-purple-500" />
                              {ent} (Entity)
                            </button>
                          ))}
                          {matchingTags.map(tag => (
                            <button
                              key={tag}
                              onMouseDown={() => {
                                navigate(`/explore/tags?tab=tags&select=${encodeURIComponent(tag)}`);
                                setHeaderQuery('');
                                setIsSearchFocused(false);
                              }}
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Authors */}
                    {matchingAuthors.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">MATCHING AUTHORS ({matchingAuthors.length})</h4>
                        <div className="space-y-1">
                          {matchingAuthors.map(author => (
                            <button
                              key={author.id}
                              onMouseDown={() => {
                                navigate(`/identity/${author.id}`);
                                setHeaderQuery('');
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                                <span className="truncate">{author.name}</span>
                                <span className="text-[10px] text-slate-400 truncate">{author.handle}</span>
                              </span>
                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 shrink-0">{author.type}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View All / Advanced Search Link */}
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 italic px-2">Type 3+ chars for quick results</span>
                      <button
                        onMouseDown={() => {
                          navigate(`/search?q=${encodeURIComponent(headerQuery)}`);
                          setHeaderQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 px-2 cursor-pointer"
                      >
                        ค้นหาขั้นสูง (Advanced Search)
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Under 3 characters warning */}
              {isSearchFocused && headerQuery.trim().length > 0 && headerQuery.trim().length < 3 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 text-left">
                  <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                    ⚠️ พิมพ์อีกอย่างน้อย {3 - headerQuery.trim().length} ตัวอักษร เพื่อเริ่มการค้นหาทันที...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/create" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors">
              <Plus className="w-4 h-4" />
              {t('nav.create')}
            </Link>
            <Link to="/create" className="sm:hidden p-2 text-blue-600 bg-blue-50 rounded-md">
              <Plus className="w-5 h-5" />
            </Link>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 hover:bg-slate-50 p-2 rounded-md border border-slate-200 transition-colors text-sm font-medium cursor-pointer"
                title="Change language / เปลี่ยนภาษา"
                id="header-lang-btn"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline-flex items-center gap-1">
                  <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag}</span>
                  <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100"
                  id="header-lang-dropdown"
                >
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-400 border-b border-slate-100 bg-slate-50">
                    Select Language / เลือกภาษา
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                          language === lang.code ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-700'
                        }`}
                        id={`lang-select-${lang.code}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {language === lang.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Identity Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsIdentityMenuOpen(!isIdentityMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 sm:pr-2 rounded-md border border-slate-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  {currentIdentity && getIdentityIcon(currentIdentity.type)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-semibold leading-tight">{currentIdentity?.name || 'Loading...'}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" /> Trust: {currentIdentity?.trustProfile.identity}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </button>

              {isIdentityMenuOpen && (
                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden py-2 px-4 space-y-2">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Identity Details</div>
                   <div className="flex items-center gap-3 py-1">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                       {currentIdentity && getIdentityIcon(currentIdentity.type)}
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className="text-sm font-bold text-slate-900 truncate">{currentIdentity?.name}</div>
                       <div className="text-xs text-slate-500 truncate">{currentIdentity?.type} • {currentIdentity?.handle}</div>
                     </div>
                   </div>
                   <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs">
                     <span className="text-slate-500">Auto-detected type</span>
                     <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">{currentIdentity?.type}</span>
                   </div>
                   <div className="pt-1">
                     <Link 
                       to={`/identity/${currentIdentity?.id}`} 
                       onClick={() => setIsIdentityMenuOpen(false)} 
                       className="block text-center w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md transition-colors"
                     >
                       View Profile
                     </Link>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Language Detection Toast/Prompt banner */}
      {showPrompt && detectedLang && (() => {
        const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === detectedLang)?.name || detectedLang;
        const targetLangFlag = SUPPORTED_LANGUAGES.find(l => l.code === detectedLang)?.flag || '';
        return (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-3 shadow-inner transition-all duration-300">
            <div className="max-w-[100rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5 text-blue-900 font-medium">
                <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  {t('langPrompt.detected')} <strong>{targetLangFlag} {targetLangName}</strong>. {t('langPrompt.ask')}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={dismissPrompt}
                  className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  {t('langPrompt.keep')}
                </button>
                <button
                  onClick={acceptPrompt}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition-colors cursor-pointer"
                >
                  {t('langPrompt.switch').replace('{lang}', targetLangName)}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Content */}
      <main className="flex-1 max-w-[100rem] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex gap-8">
        
        {/* Left Sidebar - Navigation (Responsive) */}
        <aside className={`${isMobileMenuOpen ? 'fixed inset-0 z-40 bg-white flex flex-col pt-16 px-4 overflow-y-auto' : 'hidden'} lg:block lg:static lg:w-64 lg:shrink-0`}>
          <nav className="space-y-1">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/')}>
              <span className="flex items-center gap-2.5">
                <Rss className="w-4 h-4 text-blue-600" />
                <span>{t('nav.feed')}</span>
              </span>
            </Link>
            
            <Link to="/domains" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/domains')}>
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>{t('nav.domains')}</span>
              </span>
            </Link>

            <Link to="/trending" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/trending')}>
              <span className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>{t('nav.trending')}</span>
              </span>
            </Link>

            <Link to="/challenges" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/challenges')}>
              <span className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-violet-600" />
                <span>{t('nav.challenges')}</span>
              </span>
            </Link>

            <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/search')}>
              <span className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-blue-600" />
                <span>{t('nav.search')}</span>
              </span>
            </Link>

            <Link to="/subscriptions" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/subscriptions')}>
              <span className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('nav.subscriptions')}</span>
              </span>
            </Link>

            <Link to="/messenger" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/messenger')}>
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>{t('nav.messenger')}</span>
              </span>
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-rose-500 text-white rounded-full leading-none min-w-[16px] text-center">
                  {unreadCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                  Inbox
                </span>
              )}
            </Link>

            <Link to="/organizations" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/organizations')}>
              <span className="flex items-center gap-2.5">
                <Box className="w-4 h-4 text-blue-600" />
                <span>{t('nav.organizations')}</span>
              </span>
            </Link>

            <Link to="/explore/tags" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/explore/tags')}>
              <span className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>{t('nav.tags')}</span>
              </span>
            </Link>

            <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/analytics')}>
              <span className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>{t('nav.analytics')}</span>
              </span>
            </Link>

            <Link to="/developer" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/developer')}>
              <span className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-slate-600" />
                <span>{t('nav.developer')}</span>
              </span>
            </Link>

            <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/settings')}>
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-600" />
                <span>{t('nav.settings')}</span>
              </span>
            </Link>

            <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/support')}>
              <span className="flex items-center gap-2.5">
                <Bug className="w-4 h-4 text-rose-500" />
                <span>{t('nav.support')}</span>
              </span>
            </Link>

            <Link to="/reports" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/reports')}>
              <span className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>{t('nav.reports')}</span>
              </span>
            </Link>

            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/about')}>
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>{t('nav.about')}</span>
              </span>
            </Link>
          </nav>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">My Expertise</h3>
            <div className="space-y-1 px-2">
              {currentIdentity?.expertise.map((exp, idx) => (
                <Link
                  key={idx}
                  to={`/explore/tags?tab=entities&select=${encodeURIComponent(exp.topic)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-between items-center text-sm hover:bg-slate-100 p-1.5 rounded-md transition-all border border-transparent hover:border-slate-100 group"
                >
                  <span className="text-slate-700 truncate mr-2 group-hover:text-purple-700 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                    {exp.topic}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded whitespace-nowrap group-hover:bg-purple-100 transition-colors">
                    {exp.level}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/domains" element={<TechDomains identity={currentIdentity} />} />
            <Route path="/trending" element={<TrendingArena identity={currentIdentity} />} />
            <Route path="/challenges" element={<ChallengesArena identity={currentIdentity} />} />
            <Route path="/knowledge/:id" element={<KnowledgeDetail identity={currentIdentity} />} />
            <Route path="/create" element={<CreateKnowledge identity={currentIdentity} />} />
            <Route path="/identity/:id" element={<IdentityProfile identity={currentIdentity} />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/developer" element={<DeveloperPortal />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/organizations" element={<Organizations identity={currentIdentity} />} />
            <Route path="/explore/tags" element={<TagsExplorer />} />
            <Route path="/analytics" element={<TrustAnalytics />} />
            <Route path="/reports" element={<ReportsCenter />} />
            <Route path="/messenger" element={<FullMessenger identity={currentIdentity} />} />
            <Route path="/search" element={<AdvancedSearch />} />
            <Route path="/support" element={<SupportBoard identity={currentIdentity} />} />
            <Route path="/about" element={<AboutNetwork />} />
          </Routes>
        </div>
      </main>

      {/* Persistent Floating Chat Widget */}
      <ChatWidget identity={currentIdentity} />
    </div>
  );
}
