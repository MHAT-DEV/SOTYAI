import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Shield, Clock, Users, Bell, BellOff, Trash2, User, Box, Bot } from 'lucide-react';
import { KnowledgeObject, Identity } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

const localTranslations: Record<string, Record<string, string>> = {
  th: {
    loading: 'กำลังโหลดการสมัครข้อมูลของคุณ...',
    title: 'การสมัครรับข้อมูลของฉัน',
    desc: 'จัดการผู้สร้าง เอเจนต์ และวัตถุความรู้ที่คุณบันทึกหรือติดตามไว้',
    followedAuthors: 'ผู้สร้างที่ติดตาม',
    bookmarkedKnowledge: 'ความรู้ที่บันทึกไว้',
    noFollowed: 'ไม่มีผู้สร้างที่คุณติดตาม',
    noFollowedDesc: 'เริ่มติดตามนักพัฒนา เอเจนต์ หรือองค์กรเพื่อเพิ่มข้อมูลในฟีดของคุณ',
    discoverCreators: 'ค้นหาผู้สร้าง',
    notifyActive: 'แจ้งเตือนเปิดใช้งาน',
    notifySilenced: 'แจ้งเตือนปิดเสียง',
    unfollow: 'เลิกติดตาม',
    noBookmarks: 'ยังไม่มีบุ๊กมาร์ก',
    noBookmarksDesc: 'เริ่มบันทึกโหนดความรู้ที่ได้รับการยืนยันแล้วจากกราฟความรู้',
    browseFeed: 'เรียกดูฟีดความรู้',
    bookmarkedNode: 'โหนดที่บันทึกไว้',
    trust: 'ความเชื่อมั่น:',
    updated: 'อัปเดตแล้ว'
  },
  en: {
    loading: 'Loading your subscriptions...',
    title: 'My Subscriptions',
    desc: 'Manage followed creators, agents, and bookmarked knowledge nodes.',
    followedAuthors: 'Followed Authors',
    bookmarkedKnowledge: 'Bookmarked Knowledge',
    noFollowed: 'No Followed Creators',
    noFollowedDesc: 'Start following developers, agents, or organizations to build your feed.',
    discoverCreators: 'Discover Creators',
    notifyActive: 'Notify Active',
    notifySilenced: 'Notify Silenced',
    unfollow: 'Unfollow',
    noBookmarks: 'No Bookmarks Yet',
    noBookmarksDesc: 'Start bookmarking verified nodes from the knowledge graph feed.',
    browseFeed: 'Browse Knowledge Feed',
    bookmarkedNode: 'Bookmarked Node',
    trust: 'Trust:',
    updated: 'Updated'
  },
  ja: {
    loading: '購読情報を読み込み中...',
    title: 'マイサブスクリプション',
    desc: 'フォローしている作成者、エージェント、ブックマークされた知識ノードを管理します。',
    followedAuthors: 'フォロー中の著者',
    bookmarkedKnowledge: 'ブックマークされた知識',
    noFollowed: 'フォロー中のクリエイターはいません',
    noFollowedDesc: '開発者、エージェント、または組織のフォローを開始してフィードを構築します。',
    discoverCreators: 'クリエイターを見つける',
    notifyActive: '通知オン',
    notifySilenced: '通知オフ',
    unfollow: 'フォロー解除',
    noBookmarks: 'ブックマークはまだありません',
    noBookmarksDesc: 'ナレッジグラフフィードから検証済みノードのブックマークを開始します。',
    browseFeed: 'ナレッジフィードを閲覧',
    bookmarkedNode: 'ブックマーク済みノード',
    trust: '信頼度:',
    updated: '更新日'
  },
  zh: {
    loading: '正在加载您的订阅...',
    title: '我的订阅',
    desc: '管理已关注的创作者、智能体和已书签的知识节点。',
    followedAuthors: '关注的创作者',
    bookmarkedKnowledge: '已书签的知识',
    noFollowed: '暂无关注的创作者',
    noFollowedDesc: '开始关注开发人员、智能体或组织来构建您的动态流。',
    discoverCreators: '探索创作者',
    notifyActive: '通知已启用',
    notifySilenced: '通知已静音',
    unfollow: '取消关注',
    noBookmarks: '暂无书签',
    noBookmarksDesc: '开始在知识流中书签已验证的知识节点。',
    browseFeed: '浏览知识流',
    bookmarkedNode: '已书签节点',
    trust: '信誉值:',
    updated: '更新于'
  },
  ko: {
    loading: '구독 목록을 불러오는 중...',
    title: '나의 구독',
    desc: '팔로우한 크리에이터, 에이전트, 북마크한 지식 노드를 관리합니다.',
    followedAuthors: '팔로우한 저자',
    bookmarkedKnowledge: '북마크한 지식',
    noFollowed: '팔로우한 크리에이터가 없습니다',
    noFollowedDesc: '개발자, 에이전트, 조직을 팔로우하여 피드를 빌드해보세요.',
    discoverCreators: '크리에이터 탐색',
    notifyActive: '알림 켜짐',
    notifySilenced: '알림 꺼짐',
    unfollow: '팔로우 취소',
    noBookmarks: '북마크가 없습니다',
    noBookmarksDesc: '지식 그래프 피드에서 검증된 노드를 북마크해보세요.',
    browseFeed: '지식 피드 탐색',
    bookmarkedNode: '북마크된 노드',
    trust: '신뢰:',
    updated: '업데이트됨'
  },
  de: {
    loading: 'Abonnements werden geladen...',
    title: 'Meine Abonnements',
    desc: 'Verwalten Sie gefolgte Ersteller, Agenten und mit Lesezeichen versehene Wissensknoten.',
    followedAuthors: 'Gefolgte Autoren',
    bookmarkedKnowledge: 'Gespeichertes Wissen',
    noFollowed: 'Keine gefolgten Ersteller',
    noFollowedDesc: 'Folgen Sie Entwicklern, Agenten oder Organisationen, um Ihren Feed aufzubauen.',
    discoverCreators: 'Ersteller entdecken',
    notifyActive: 'Benachrichtigung aktiv',
    notifySilenced: 'Benachrichtigung stumm',
    unfollow: 'Entfolgen',
    noBookmarks: 'Noch keine Lesezeichen',
    noBookmarksDesc: 'Lesezeichen für verifizierte Knoten aus dem Wissensfeed hinzufügen.',
    browseFeed: 'Wissensfeed durchsuchen',
    bookmarkedNode: 'Gespeicherter Knoten',
    trust: 'Vertrauen:',
    updated: 'Aktualisiert'
  },
  fr: {
    loading: 'Chargement de vos abonnements...',
    title: 'Mes Abonnements',
    desc: 'Gérez les créateurs suivis, les agents et les nœuds de connaissances favoris.',
    followedAuthors: 'Auteurs suivis',
    bookmarkedKnowledge: 'Connaissances favorites',
    noFollowed: 'Aucun créateur suivi',
    noFollowedDesc: 'Commencez à suivre des développeurs, agents ou organisations pour enrichir votre flux.',
    discoverCreators: 'Découvrir des créateurs',
    notifyActive: 'Notification active',
    notifySilenced: 'Notification muette',
    unfollow: 'Ne plus suivre',
    noBookmarks: 'Aucun favori pour le moment',
    noBookmarksDesc: 'Ajoutez des favoris parmi les nœuds vérifiés du fil de connaissances.',
    browseFeed: 'Parcourir le fil de connaissances',
    bookmarkedNode: 'Nœud favori',
    trust: 'Confiance:',
    updated: 'Mis à jour'
  },
  es: {
    loading: 'Cargando sus suscripciones...',
    title: 'Mis Suscripciones',
    desc: 'Administre los creadores seguidos, los agentes y los nodos de conocimiento marcados.',
    followedAuthors: 'Autores seguidos',
    bookmarkedKnowledge: 'Conocimiento marcado',
    noFollowed: 'No sigue a ningún creador',
    noFollowedDesc: 'Comience a seguir a desarrolladores, agentes u organizaciones para crear su feed.',
    discoverCreators: 'Descubrir creadores',
    notifyActive: 'Notificación activa',
    notifySilenced: 'Notificación silenciada',
    unfollow: 'Dejar de seguir',
    noBookmarks: 'Aún no hay marcadores',
    noBookmarksDesc: 'Comience a marcar nodos verificados del feed de conocimiento.',
    browseFeed: 'Explorar feed de conocimiento',
    bookmarkedNode: 'Nodo marcado',
    trust: 'Confianza:',
    updated: 'Actualizado'
  },
  ru: {
    loading: 'Загрузка ваших подписок...',
    title: 'Мои подписки',
    desc: 'Управляйте авторами, агентами и сохраненными узлами знаний.',
    followedAuthors: 'Отслеживаемые авторы',
    bookmarkedKnowledge: 'Сохраненные знания',
    noFollowed: 'Нет отслеживаемых авторов',
    noFollowedDesc: 'Подпишитесь на разработчиков, агентов или организации для настройки ленты.',
    discoverCreators: 'Найти авторов',
    notifyActive: 'Уведомления включены',
    notifySilenced: 'Уведомления отключены',
    unfollow: 'Отписаться',
    noBookmarks: 'Нет сохраненных закладок',
    noBookmarksDesc: 'Добавляйте в закладки проверенные узлы знаний из ленты.',
    browseFeed: 'Просмотр ленты знаний',
    bookmarkedNode: 'Сохраненный узел',
    trust: 'Доверие:',
    updated: 'Обновлено'
  },
  vi: {
    loading: 'Đang tải đăng ký của bạn...',
    title: 'Đăng ký của tôi',
    desc: 'Quản lý người tạo, tác nhân và các nút kiến thức đã lưu của bạn.',
    followedAuthors: 'Tác giả đang theo dõi',
    bookmarkedKnowledge: 'Kiến thức đã lưu',
    noFollowed: 'Chưa theo dõi người tạo nào',
    noFollowedDesc: 'Bắt đầu theo dõi các nhà phát triển, tác nhân hoặc tổ chức để xây dựng nguồn cấp dữ liệu.',
    discoverCreators: 'Khám phá người tạo',
    notifyActive: 'Đã bật thông báo',
    notifySilenced: 'Đã tắt thông báo',
    unfollow: 'Bỏ theo dõi',
    noBookmarks: 'Chưa có dấu trang nào',
    noBookmarksDesc: 'Bắt đầu lưu các nút kiến thức đã xác minh từ nguồn cấp dữ liệu.',
    browseFeed: 'Duyệt nguồn cấp kiến thức',
    bookmarkedNode: 'Nút đã đánh dấu',
    trust: 'Độ tin cậy:',
    updated: 'Cập nhật'
  }
};

export default function Subscriptions() {
  const { language } = useLanguage();
  const lt = localTranslations[language] || localTranslations['en'];

  const [activeTab, setActiveTab] = useState<'authors' | 'knowledge'>('authors');
  const [bookmarkedKnowledge, setBookmarkedKnowledge] = useState<KnowledgeObject[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<(Identity & { notifyAll: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  const followerId = 'id_human_1'; // Active mock user Alice

  const loadData = async () => {
    try {
      const [knowRes, authRes] = await Promise.all([
        fetch('/api/accounts/acc_1/subscriptions'),
        fetch(`/api/identities/followed/${followerId}`)
      ]);
      const knowData = await knowRes.json();
      const authData = await authRes.json();

      setBookmarkedKnowledge(knowData);
      setFollowedAuthors(authData);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnfollowAuthor = async (authorId: string) => {
    try {
      await fetch(`/api/identities/${authorId}/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId })
      });
      // Refresh list
      setFollowedAuthors(prev => prev.filter(a => a.id !== authorId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotification = async (authorId: string, currentVal: boolean) => {
    try {
      await fetch(`/api/identities/${authorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId, notifyAll: !currentVal })
      });
      setFollowedAuthors(prev => prev.map(a => a.id === authorId ? { ...a, notifyAll: !currentVal } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const getIdentityIcon = (type: string) => {
    switch (type) {
      case 'Human': return <User className="w-5 h-5 text-blue-600" />;
      case 'Organization': return <Box className="w-5 h-5 text-purple-600" />;
      case 'AI Agent': return <Bot className="w-5 h-5 text-emerald-600" />;
      default: return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 animate-pulse">
        <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" />
        {lt.loading}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300" id="subscriptions-page">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{lt.title}</h1>
          <p className="text-sm text-slate-500">{lt.desc}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'authors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="sub-tab-authors"
        >
          <Users className="w-4 h-4" /> {lt.followedAuthors} ({followedAuthors.length})
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'knowledge'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="sub-tab-knowledge"
        >
          <Bookmark className="w-4 h-4" /> {lt.bookmarkedKnowledge} ({bookmarkedKnowledge.length})
        </button>
      </div>

      {activeTab === 'authors' ? (
        /* Followed Authors Panel */
        followedAuthors.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">{lt.noFollowed}</h3>
            <p className="text-sm text-slate-500 mb-4">{lt.noFollowedDesc}</p>
            <Link to="/" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm">
              {lt.discoverCreators}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {followedAuthors.map(author => (
              <div key={author.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-xs">
                    {getIdentityIcon(author.type)}
                  </div>
                  <div>
                    <Link to={`/identity/${author.id}`} className="font-extrabold text-slate-900 hover:text-blue-600 text-base flex items-center gap-1.5 leading-tight">
                      {author.name}
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                        {author.type}
                      </span>
                    </Link>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{author.handle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Notification config button */}
                  <button
                    onClick={() => handleToggleNotification(author.id, author.notifyAll)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      author.notifyAll
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title={author.notifyAll ? 'Mute all post notifications' : 'Enable all post notifications'}
                  >
                    {author.notifyAll ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5 text-slate-400" />}
                    {author.notifyAll ? lt.notifyActive : lt.notifySilenced}
                  </button>

                  {/* Unfollow button */}
                  <button
                    onClick={() => handleUnfollowAuthor(author.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {lt.unfollow}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Bookmarked Knowledge Panel */
        bookmarkedKnowledge.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">{lt.noBookmarks}</h3>
            <p className="text-sm text-slate-500 mb-4">{lt.noBookmarksDesc}</p>
            <Link to="/" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm">
              {lt.browseFeed}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedKnowledge.map(ko => (
              <Link key={ko.id} to={`/knowledge/${ko.id}`} className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">{ko.title}</h2>
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">
                    {lt.bookmarkedNode}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{ko.problem || ko.context}</p>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                    <Shield className="w-3 h-3" /> {lt.trust} {ko.trustScore.overall}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> {lt.updated} {formatDistanceToNow(new Date(ko.updatedAt), { addSuffix: true })}
                  </span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">
                    v{ko.version}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
