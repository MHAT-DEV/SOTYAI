import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Identity, ActivityEvent } from '../types';
import { Shield, User, Box, Bot, Activity, Award, Star, BookOpen, CheckCircle, Target, Users, Key, History, Link as LinkIcon, Briefcase, Lock, Unlock, MessageSquare, Send, Heart, Plus, Trash2, Globe, Settings, UserCheck } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

interface IdentityProfileProps {
  identity: Identity | null;
}

const localTranslations: Record<string, Record<string, string>> = {
  th: {
    loading: 'กำลังโหลดโปรไฟล์...',
    notFound: 'ไม่พบข้อมูลประจำตัว',
    following: 'กำลังติดตาม',
    follow: 'ติดตาม',
    sendMessage: 'ส่งข้อความ',
    type: 'ประเภท',
    visibility: 'ทัศนวิสัย',
    humanFollowers: 'ผู้ติดตามที่เป็นมนุษย์',
    aiFollowers: 'ผู้ติดตามที่เป็น AI',
    organizations: 'องค์กร',
    enterprise: 'ระบบวิสาหกิจ',
    trustProfile: 'โปรไฟล์ความน่าเชื่อถือ',
    verifications: 'การยืนยันตัวตน',
    badges: 'ตราสัญลักษณ์',
    reputation: 'มิติชื่อเสียง',
    expertise: 'กราฟความเชี่ยวชาญ',
    recentActivity: 'กิจกรรมล่าสุด',
    publicGroup: 'กลุ่มสาธารณะ',
    privateGroup: 'กลุ่มส่วนตัว',
    isMember: 'เป็นสมาชิกแล้ว',
    leaveSpace: 'ออกจากกลุ่ม',
    joinSpace: 'เข้าร่วมกลุ่ม (Join Space)',
    members: 'สมาชิก',
    posts: 'โพสต์ในกลุ่ม',
    trustScore: 'คะแนนความน่าเชื่อถือสเปซ',
    publicDesc: 'สเปซสาธารณะ (ทุกคนเข้าถึงได้)',
    privateDesc: 'สเปซส่วนตัว (เฉพาะสมาชิก)',
    privateWarningTitle: 'กลุ่มสเปซนี้เป็นแบบส่วนตัว (Private Space)',
    privateWarningDesc: 'เนื้อหา โพสต์ สมาชิก และห้องแชทของกลุ่มนี้ถูกจำกัดไว้เฉพาะสมาชิกที่ได้รับอนุญาตเท่านั้น กรุณากดเข้าร่วมกลุ่มเพื่อเข้าถึงเนื้อหาภายในกลุ่ม',
    joinGroupNow: 'เข้าร่วมกลุ่มเลย',
    menu: 'เมนูของกลุ่ม',
    postsTab: 'โพสต์และฟีด (Posts)',
    chatTab: 'แชทกลุ่ม (Group Chat)',
    membersTab: 'รายชื่อสมาชิก',
    settingsTab: 'การตั้งค่ากลุ่ม (Settings)',
    rules: 'กฎระเบียบของกลุ่ม',
    rulesDesc: '1. แลกเปลี่ยนความรู้ด้วยความสุภาพและอิงข้อเท็จจริงทางวิชาการ 2. สนับสนุนการแชร์ Node ความรู้ที่มีการตรวจสอบ (Verified Node) เพื่อลด AI Slop 3. ไม่แชร์ความลับองค์กรหรือ API Key สาธารณะเด็ดขาด',
    postPlaceholder: 'เขียนอะไรบางอย่างเพื่อแบ่งปันข้อมูลให้กับคนในกลุ่มสเปซนี้...',
    postButton: 'โพสต์เลย',
    commentPlaceholder: 'แสดงความคิดเห็นต่อโพสต์นี้...',
    send: 'ส่ง',
    chatPlaceholder: 'พิมพ์ข้อความคุยกับทีม...',
    addMemberTitle: 'เพิ่มสมาชิกใหม่เข้ากลุ่มสเปซ (Add Members)',
    addMemberDesc: 'ในฐานะ Admin คุณสามารถค้นหารายชื่อผู้ใช้และบอท เพื่อเพิ่มความร่วมมือเข้าสู่กลุ่มได้ทันที',
    addMemberBtn: 'เพิ่มเข้าสเปซ',
    roles: 'บทบาท:'
  },
  en: {
    loading: 'Loading Trust Profile...',
    notFound: 'Identity not found',
    following: 'Following',
    follow: 'Follow',
    sendMessage: 'Send Message',
    type: 'Type',
    visibility: 'Visibility',
    humanFollowers: 'Human Followers',
    aiFollowers: 'AI Followers',
    organizations: 'Organizations',
    enterprise: 'Enterprise Systems',
    trustProfile: 'Trust Profile',
    verifications: 'Verifications',
    badges: 'Badges',
    reputation: 'Reputation Dimensions',
    expertise: 'Expertise Graph',
    recentActivity: 'Recent Activity',
    publicGroup: 'Public Group',
    privateGroup: 'Private Group',
    isMember: 'Is Member',
    leaveSpace: 'Leave Space',
    joinSpace: 'Join Space',
    members: 'Members',
    posts: 'Space Posts',
    trustScore: 'Space Trust Score',
    publicDesc: 'Public Space (accessible to everyone)',
    privateDesc: 'Private Space (members only)',
    privateWarningTitle: 'This is a Private Space',
    privateWarningDesc: 'Contents, posts, member lists, and chat rooms are restricted to authorized members only. Please join the space to access its contents.',
    joinGroupNow: 'Join Space Now',
    menu: 'Group Menu',
    postsTab: 'Posts & Feed',
    chatTab: 'Group Chat',
    membersTab: 'Members List',
    settingsTab: 'Group Settings',
    rules: 'Group Rules',
    rulesDesc: '1. Exchange knowledge politely and academically. 2. Support sharing Verified Nodes to reduce AI Slop. 3. Strictly do not share organization secrets or public API Keys.',
    postPlaceholder: 'Write something to share with the group in this space...',
    postButton: 'Post Now',
    commentPlaceholder: 'Leave a comment on this post...',
    send: 'Send',
    chatPlaceholder: 'Type a message to the team...',
    addMemberTitle: 'Add New Members to Space',
    addMemberDesc: 'As an Admin, you can search for users and bots to invite and add to the space immediately.',
    addMemberBtn: 'Add to Space',
    roles: 'Roles:'
  },
  ja: {
    loading: '信頼プロファイルを読み込み中...',
    notFound: 'アイデンティティが見つかりません',
    following: 'フォロー中',
    follow: 'フォローする',
    sendMessage: 'メッセージを送信',
    type: 'タイプ',
    visibility: '公開範囲',
    humanFollowers: '人間のフォロワー',
    aiFollowers: 'AIフォロワー',
    organizations: '組織',
    enterprise: 'エンタープライズシステム',
    trustProfile: '信頼プロファイル',
    verifications: '検証',
    badges: 'バッジ',
    reputation: 'レピュテーションディメンション',
    expertise: '専門分野グラフ',
    recentActivity: '最近のアクティビティ',
    publicGroup: 'パブリックグループ',
    privateGroup: 'プライベートグループ',
    isMember: 'メンバー登録済み',
    leaveSpace: 'スペースを退会',
    joinSpace: 'スペースに参加 (Join Space)',
    members: 'メンバー',
    posts: 'スペース内の投稿',
    trustScore: 'スペース信頼度スコア',
    publicDesc: 'パブリックスペース（誰でもアクセス可能）',
    privateDesc: 'プライベートスペース（メンバーのみ）',
    privateWarningTitle: 'このスペースは非公開です（Private Space）',
    privateWarningDesc: 'このグループのコンテンツ、投稿、メンバーリスト、チャットルームは、承認されたメンバーのみに制限されています。内部コンテンツにアクセスするには、グループに参加してください。',
    joinGroupNow: '今すぐグループに参加する',
    menu: 'グループメニュー',
    postsTab: '投稿とフィード (Posts)',
    chatTab: 'グループチャット (Group Chat)',
    membersTab: 'メンバーリスト',
    settingsTab: 'グループ設定 (Settings)',
    rules: 'グループの規則',
    rulesDesc: '1. 礼儀正しく、学術的事実に基づいて知識を交換します。2. AI Slopを減らすために、検証済みのナレッジノードの共有を支援します。3. 組織の秘密や公開APIキーは絶対に共有しないでください。',
    postPlaceholder: 'このスペースのメンバーに何か情報を共有しましょう...',
    postButton: '今すぐ投稿',
    commentPlaceholder: 'この投稿にコメントを書く...',
    send: '送信',
    chatPlaceholder: 'チームとチャットするメッセージを入力...',
    addMemberTitle: 'スペースに新しいメンバーを追加 (Add Members)',
    addMemberDesc: '管理者として、ユーザーやボットを検索し、すぐにスペースに招待してコラボレーションを追加できます。',
    addMemberBtn: 'スペースに追加',
    roles: '役割:'
  },
  zh: {
    loading: '正在加载信任特征...',
    notFound: '未找到身份信息',
    following: '正在关注',
    follow: '关注',
    sendMessage: '发送消息',
    type: '类型',
    visibility: '可见性',
    humanFollowers: '人类关注者',
    aiFollowers: 'AI关注者',
    organizations: '组织成员',
    enterprise: '企业系统',
    trustProfile: '信任特征',
    verifications: '认证资质',
    badges: '荣誉徽章',
    reputation: '声誉度量',
    expertise: '专业技能图谱',
    recentActivity: '最近动态',
    publicGroup: '公开群组',
    privateGroup: '私有群组',
    isMember: '已加入成员',
    leaveSpace: '退出空间',
    joinSpace: '加入空间 (Join Space)',
    members: '群组成员',
    posts: '空间帖子',
    trustScore: '空间信任评分',
    publicDesc: '公开空间（所有人可访问）',
    privateDesc: '私有空间（仅限成员）',
    privateWarningTitle: '此空间群组为私有空间 (Private Space)',
    privateWarningDesc: '此群组的内容、帖子、成员列表和聊天室仅对授权成员开放。请先申请加入空间以访问内部内容。',
    joinGroupNow: '立即加入群组',
    menu: '群组菜单',
    postsTab: '帖子与动态 (Posts)',
    chatTab: '群组聊天 (Group Chat)',
    membersTab: '成员名单',
    settingsTab: '空间设置 (Settings)',
    rules: '群组规范',
    rulesDesc: '1. 以礼貌和学术事实为基础交流知识。2. 鼓励分享经过验证的知识节点以减少 AI 废话。3. 严禁分享组织机密或公共 API 密钥。',
    postPlaceholder: '写点什么与空间群组中的成员分享吧...',
    postButton: '立即发布',
    commentPlaceholder: '发表评论...',
    send: '发送',
    chatPlaceholder: '输入消息与团队互动...',
    addMemberTitle: '向空间添加新成员 (Add Members)',
    addMemberDesc: '作为管理员，您可以直接搜索用户或机器人并拉入空间以展开协作。',
    addMemberBtn: '添加到空间',
    roles: '角色权限:'
  },
  ko: {
    loading: '신뢰 프로필 로딩 중...',
    notFound: '프로필을 찾을 수 없습니다',
    following: '팔로잉',
    follow: '팔로우',
    sendMessage: '메시지 전송',
    type: '유형',
    visibility: '공개 상태',
    humanFollowers: '일반 팔로워',
    aiFollowers: 'AI 팔로워',
    organizations: '소속 기관',
    enterprise: '엔터프라이즈 시스템',
    trustProfile: '신뢰 프로필',
    verifications: '인증 내역',
    badges: '보유 배지',
    reputation: '평판 지표',
    expertise: '전문 분야 분석',
    recentActivity: '최근 활동',
    publicGroup: '공개 그룹',
    privateGroup: '비공개 그룹',
    isMember: '가입된 멤버',
    leaveSpace: '그룹 탈퇴',
    joinSpace: '그룹 가입 (Join Space)',
    members: '멤버 수',
    posts: '작성된 포스트',
    trustScore: '그룹 신뢰 지수',
    publicDesc: '공개 스페이스 (모두 접근 가능)',
    privateDesc: '비공개 스페이스 (멤버 전용)',
    privateWarningTitle: '이 그룹 스페이스는 비공개(Private Space)입니다',
    privateWarningDesc: '이 그룹의 컨텐츠, 게시글, 멤버 및 채팅방은 허가된 멤버만 접근할 수 있습니다. 스페이스에 가입하여 내부 컨텐츠에 액세스하세요.',
    joinGroupNow: '그룹 지금 가입하기',
    menu: '그룹 메뉴',
    postsTab: '포스트 및 피드 (Posts)',
    chatTab: '그룹 채팅 (Group Chat)',
    membersTab: '멤버 리스트',
    settingsTab: '그룹 설정 (Settings)',
    rules: '그룹 규칙',
    rulesDesc: '1. 정중하고 학술적 사실에 의거하여 지식을 공유합니다. 2. AI Slop을 방지하기 위해 검증된 노드 공유를 지향합니다. 3. 기업 기밀 혹은 API Key를 공유하는 행위는 엄격히 금지됩니다.',
    postPlaceholder: '그룹원들과 공유할 내용을 자유롭게 작성하세요...',
    postButton: '게시하기',
    commentPlaceholder: '댓글 남기기...',
    send: '전송',
    chatPlaceholder: '멤버들과 소통할 메시지 입력...',
    addMemberTitle: '그룹에 새로운 멤버 초대하기 (Add Members)',
    addMemberDesc: 'Admin 권한으로 새로운 사용자나 봇을 검색하고 그룹에 바로 추가하여 협업할 수 있습니다.',
    addMemberBtn: '그룹에 추가',
    roles: '역할:'
  },
  de: {
    loading: 'Vertrauensprofil wird geladen...',
    notFound: 'Identität nicht gefunden',
    following: 'Folge ich',
    follow: 'Folgen',
    sendMessage: 'Nachricht senden',
    type: 'Typ',
    visibility: 'Sichtbarkeit',
    humanFollowers: 'Menschliche Follower',
    aiFollowers: 'KI-Follower',
    organizations: 'Organisationen',
    enterprise: 'Unternehmenssysteme',
    trustProfile: 'Vertrauensprofil',
    verifications: 'Verifizierungen',
    badges: 'Abzeichen',
    reputation: 'Reputationsdimensionen',
    expertise: 'Expertisegraf',
    recentActivity: 'Letzte Aktivität',
    publicGroup: 'Öffentliche Gruppe',
    privateGroup: 'Private Gruppe',
    isMember: 'Ist Mitglied',
    leaveSpace: 'Gruppe verlassen',
    joinSpace: 'Gruppe beitreten (Join Space)',
    members: 'Mitglieder',
    posts: 'Gruppenbeiträge',
    trustScore: 'Gruppen-Vertrauenswert',
    publicDesc: 'Öffentlicher Bereich (für alle zugänglich)',
    privateDesc: 'Privater Bereich (nur für Mitglieder)',
    privateWarningTitle: 'Diese Gruppe ist privat (Private Space)',
    privateWarningDesc: 'Inhalte, Beiträge, Mitgliederlisten und Chaträume dieser Gruppe sind auf autorisierte Mitglieder beschränkt. Bitte treten Sie der Gruppe bei, um auf interne Inhalte zuzugreifen.',
    joinGroupNow: 'Gruppe beitreten',
    menu: 'Gruppenmenü',
    postsTab: 'Beiträge & Feed (Posts)',
    chatTab: 'Gruppenchat (Group Chat)',
    membersTab: 'Mitgliederliste',
    settingsTab: 'Gruppeneinstellungen (Settings)',
    rules: 'Gruppenregeln',
    rulesDesc: '1. Tauschen Sie Wissen höflich und wissenschaftlich fundiert aus. 2. Unterstützen Sie das Teilen verifizierter Wissensknoten, um AI-Slop zu reduzieren. 3. Teilen Sie niemals Unternehmensgeheimnisse oder öffentliche API-Schlüssel.',
    postPlaceholder: 'Schreiben Sie etwas, um es mit den Mitgliedern dieser Gruppe zu teilen...',
    postButton: 'Jetzt posten',
    commentPlaceholder: 'Hinterlassen Sie einen Kommentar...',
    send: 'Senden',
    chatPlaceholder: 'Schreiben Sie eine Nachricht an das Team...',
    addMemberTitle: 'Neues Mitglied zur Gruppe hinzufügen (Add Members)',
    addMemberDesc: 'Als Administrator können Sie nach Benutzern und Bots suchen, um sie sofort der Gruppe hinzuzufügen.',
    addMemberBtn: 'Hinzufügen',
    roles: 'Rollen:'
  },
  fr: {
    loading: 'Chargement du profil de confiance...',
    notFound: 'Identité introuvable',
    following: 'Abonné',
    follow: 'S\'abonner',
    sendMessage: 'Envoyer un Message',
    type: 'Type',
    visibility: 'Visibilité',
    humanFollowers: 'Abonnés Humains',
    aiFollowers: 'Abonnés IA',
    organizations: 'Organisations',
    enterprise: 'Systèmes d\'Entreprise',
    trustProfile: 'Profil de Confiance',
    verifications: 'Vérifications',
    badges: 'Badges',
    reputation: 'Dimensions de Réputation',
    expertise: 'Graphe d\'Expertise',
    recentActivity: 'Activité Récente',
    publicGroup: 'Groupe Public',
    privateGroup: 'Groupe Privé',
    isMember: 'Est Membre',
    leaveSpace: 'Quitter l\'Espace',
    joinSpace: 'Rejoindre l\'Espace',
    members: 'Membres',
    posts: 'Publications',
    trustScore: 'Score de Confiance de l\'Espace',
    publicDesc: 'Espace Public (accessible à tous)',
    privateDesc: 'Espace Privé (membres uniquement)',
    privateWarningTitle: 'Cet espace est privé (Private Space)',
    privateWarningDesc: 'Le contenu, les publications, la liste des membres et les salons de discussion de ce groupe sont réservés aux membres autorisés. Veuillez rejoindre le groupe pour accéder au contenu interne.',
    joinGroupNow: 'Rejoindre le groupe maintenant',
    menu: 'Menu du Groupe',
    postsTab: 'Publications & Flux (Posts)',
    chatTab: 'Chat du Groupe (Group Chat)',
    membersTab: 'Liste des Membres',
    settingsTab: 'Paramètres du Groupe (Settings)',
    rules: 'Règles du Groupe',
    rulesDesc: '1. Échangez vos connaissances poliment et sur des bases académiques. 2. Encouragez le partage de nœuds de connaissances vérifiés pour limiter l\'AI Slop. 3. Ne partagez jamais de secrets d\'entreprise ni de clés d\'API publiques.',
    postPlaceholder: 'Écrivez quelque chose à partager avec les membres du groupe...',
    postButton: 'Publier',
    commentPlaceholder: 'Laisser un commentaire...',
    send: 'Envoyer',
    chatPlaceholder: 'Tapez un message pour l\'équipe...',
    addMemberTitle: 'Ajouter de nouveaux membres (Add Members)',
    addMemberDesc: 'En tant qu\'Admin, vous pouvez rechercher des utilisateurs et des bots à ajouter à l\'espace immédiatement.',
    addMemberBtn: 'Ajouter',
    roles: 'Rôles :'
  },
  es: {
    loading: 'Cargando perfil de confianza...',
    notFound: 'Identidad no encontrada',
    following: 'Siguiendo',
    follow: 'Seguir',
    sendMessage: 'Enviar Mensaje',
    type: 'Tipo',
    visibility: 'Visibilidad',
    humanFollowers: 'Seguidores Humanos',
    aiFollowers: 'Seguidores de IA',
    organizations: 'Organizaciones',
    enterprise: 'Sistemas Empresariales',
    trustProfile: 'Perfil de Confianza',
    verifications: 'Verificaciones',
    badges: 'Insignias',
    reputation: 'Dimensiones de Reputación',
    expertise: 'Gráfico de Experiencia',
    recentActivity: 'Actividad Reciente',
    publicGroup: 'Grupo Público',
    privateGroup: 'Grupo Privado',
    isMember: 'Es Miembro',
    leaveSpace: 'Salir del Grupo',
    joinSpace: 'Unirse al Grupo (Join Space)',
    members: 'Miembros',
    posts: 'Publicaciones del Grupo',
    trustScore: 'Puntaje de Confianza',
    publicDesc: 'Espacio Público (accesible para todos)',
    privateDesc: 'Espacio Privado (solo miembros)',
    privateWarningTitle: 'Este grupo es privado (Private Space)',
    privateWarningDesc: 'El contenido, publicaciones, lista de miembros y salas de chat de este grupo están limitados únicamente a miembros autorizados. Únase al grupo para acceder.',
    joinGroupNow: 'Unirse al grupo ahora',
    menu: 'Menú del Grupo',
    postsTab: 'Publicaciones y Feed (Posts)',
    chatTab: 'Chat del Grupo (Group Chat)',
    membersTab: 'Lista de Miembros',
    settingsTab: 'Configuración del Grupo (Settings)',
    rules: 'Reglas del Grupo',
    rulesDesc: '1. Intercambie conocimientos con cortesía y basado en hechos académicos. 2. Promueva el intercambio de Nodos Verificados para reducir el AI Slop. 3. No comparta secretos de la empresa ni claves API públicas.',
    postPlaceholder: 'Escriba algo para compartir con los miembros de este espacio...',
    postButton: 'Publicar ahora',
    commentPlaceholder: 'Deja un comentario...',
    send: 'Enviar',
    chatPlaceholder: 'Escribe un mensaje para el equipo...',
    addMemberTitle: 'Agregar nuevo miembro al espacio (Add Members)',
    addMemberDesc: 'Como Administrador, puede buscar usuarios y bots para agregarlos al espacio inmediatamente.',
    addMemberBtn: 'Agregar',
    roles: 'Roles:'
  },
  ru: {
    loading: 'Загрузка доверенного профиля...',
    notFound: 'Профиль не найден',
    following: 'Вы подписаны',
    follow: 'Подписаться',
    sendMessage: 'Написать',
    type: 'Тип',
    visibility: 'Видимость',
    humanFollowers: 'Подписчики (Люди)',
    aiFollowers: 'Подписчики (ИИ)',
    organizations: 'Организации',
    enterprise: 'Корпоративные системы',
    trustProfile: 'Доверенный профиль',
    verifications: 'Верификации',
    badges: 'Значки',
    reputation: 'Параметры репутации',
    expertise: 'График компетенций',
    recentActivity: 'Последняя активность',
    publicGroup: 'Открытая группа',
    privateGroup: 'Закрытая группа',
    isMember: 'Участник',
    leaveSpace: 'Выйти из группы',
    joinSpace: 'Вступить в группу (Join Space)',
    members: 'Участники',
    posts: 'Посты в группе',
    trustScore: 'Индекс доверия группы',
    publicDesc: 'Публичная группа (доступна всем)',
    privateDesc: 'Закрытая группа (только участникам)',
    privateWarningTitle: 'Эта группа является закрытой (Private Space)',
    privateWarningDesc: 'Контент, публикации, список участников и чаты этой группы доступны только верифицированным членам. Пожалуйста, отправьте запрос на вступление, чтобы получить доступ.',
    joinGroupNow: 'Вступить в группу',
    menu: 'Меню группы',
    postsTab: 'Публикации и фид (Posts)',
    chatTab: 'Чат группы (Group Chat)',
    membersTab: 'Список участников',
    settingsTab: 'Настройки группы (Settings)',
    rules: 'Правила сообщества',
    rulesDesc: '1. Общайтесь уважительно и приводите научные факты. 2. Поддерживайте верифицированные узлы знаний для борьбы с ИИ-мусором (AI Slop). 3. Категорически запрещено делиться коммерческой тайной или API ключами.',
    postPlaceholder: 'Напишите что-нибудь, чтобы поделиться с участниками сообщества...',
    postButton: 'Опубликовать',
    commentPlaceholder: 'Написать комментарий...',
    send: 'Отправить',
    chatPlaceholder: 'Введите сообщение...',
    addMemberTitle: 'Добавить участников в группу (Add Members)',
    addMemberDesc: 'В качестве администратора вы можете осуществлять поиск пользователей и ботов для немедленного приглашения в пространство.',
    addMemberBtn: 'Добавить',
    roles: 'Роль:'
  },
  vi: {
    loading: 'Đang tải hồ sơ độ tin cậy...',
    notFound: 'Không tìm thấy danh tính',
    following: 'Đang theo dõi',
    follow: 'Theo dõi',
    sendMessage: 'Gửi tin nhắn',
    type: 'Loại',
    visibility: 'Trạng thái',
    humanFollowers: 'Người theo dõi (Người)',
    aiFollowers: 'Người theo dõi (AI)',
    organizations: 'Tổ chức',
    enterprise: 'Hệ thống doanh nghiệp',
    trustProfile: 'Hồ sơ tin cậy',
    verifications: 'Xác minh',
    badges: 'Huy hiệu',
    reputation: 'Chỉ số uy tín',
    expertise: 'Biểu đồ chuyên môn',
    recentActivity: 'Hoạt động gần đây',
    publicGroup: 'Nhóm công khai',
    privateGroup: 'Nhóm riêng tư',
    isMember: 'Đã là thành viên',
    leaveSpace: 'Rời khỏi nhóm',
    joinSpace: 'Tham gia nhóm (Join Space)',
    members: 'Thành viên',
    posts: 'Bài viết trong nhóm',
    trustScore: 'Điểm tin cậy không gian',
    publicDesc: 'Không gian công cộng (mọi người đều có thể truy cập)',
    privateDesc: 'Không gian riêng tư (chỉ dành cho thành viên)',
    privateWarningTitle: 'Không gian này là riêng tư (Private Space)',
    privateWarningDesc: 'Nội dung, bài viết, danh sách thành viên và phòng trò chuyện của nhóm này bị giới hạn cho thành viên được ủy quyền. Vui lòng tham gia nhóm để truy cập.',
    joinGroupNow: 'Tham gia nhóm ngay',
    menu: 'Trình đơn nhóm',
    postsTab: 'Bài viết & Nguồn cấp (Posts)',
    chatTab: 'Trò chuyện nhóm (Group Chat)',
    membersTab: 'Danh sách thành viên',
    settingsTab: 'Cài đặt nhóm (Settings)',
    rules: 'Quy định nhóm',
    rulesDesc: '1. Trao đổi kiến thức lịch sự và dựa trên dữ liệu học thuật. 2. Khuyến khích chia sẻ Nút kiến thức đã xác minh để giảm AI Slop. 3. Tuyệt đối không chia sẻ bí mật doanh nghiệp hoặc API Key.',
    postPlaceholder: 'Viết nội dung chia sẻ với mọi người trong không gian này...',
    postButton: 'Đăng ngay',
    commentPlaceholder: 'Để lại bình luận...',
    send: 'Gửi',
    chatPlaceholder: 'Nhập tin nhắn trò chuyện với nhóm...',
    addMemberTitle: 'Thêm thành viên mới vào không gian (Add Members)',
    addMemberDesc: 'Với vai trò Admin, bạn có thể tìm kiếm người dùng và bot để thêm vào không gian làm việc ngay lập tức.',
    addMemberBtn: 'Thêm vào không gian',
    roles: 'Vai trò:'
  }
};

export default function IdentityProfile({ identity }: IdentityProfileProps) {
  const { language } = useLanguage();
  const lt = localTranslations[language] || localTranslations['en'];

  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Identity | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Message states
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/identities/${id}`).then(r => r.json()),
      fetch(`/api/identities/${id}/activities`).then(r => r.json())
    ]).then(([profileData, activityData]) => {
      if (!profileData.error) {
        setProfile(profileData);
        setActivities(activityData);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (id && identity) {
      // Check follow state
      fetch(`/api/identities/${id}/isFollowing?followerId=${identity.id}`)
        .then(res => res.json())
        .then(data => {
          setIsFollowing(data.following);
          setNotifyAll(data.notifyAll);
        })
        .catch(err => console.error(err));
    }
  }, [id, identity]);

  useEffect(() => {
    if (isMessageModalOpen && id && identity) {
      // Load message logs
      fetch(`/api/messages?senderId=${identity.id}&receiverId=${id}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data);
          // Mark messages as read if there are unread incoming messages in the thread
          const hasUnread = data.some((m: any) => m.senderId === id && m.receiverId === identity.id && !m.read);
          if (hasUnread) {
            fetch('/api/messages/read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ senderId: id, receiverId: identity.id })
            });
          }
        })
        .catch(err => console.error(err));
    }
  }, [isMessageModalOpen, id, identity]);

  const handleFollowToggle = async () => {
    if (!identity || !id) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await fetch(`/api/identities/${id}/unfollow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerId: identity.id })
        });
        setIsFollowing(false);
        setNotifyAll(false);
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            followers: {
              ...prev.followers,
              human: Math.max(0, prev.followers.human - 1)
            }
          } : null);
        }
      } else {
        await fetch(`/api/identities/${id}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerId: identity.id, notifyAll: notifyAll })
        });
        setIsFollowing(true);
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            followers: {
              ...prev.followers,
              human: prev.followers.human + 1
            }
          } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleNotifyAllToggle = async (val: boolean) => {
    if (!identity || !id) return;
    setNotifyAll(val);
    if (isFollowing) {
      try {
        await fetch(`/api/identities/${id}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerId: identity.id, notifyAll: val })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !identity || !id) return;
    setIsSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: identity.id,
          receiverId: id,
          content: newMessage
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // --- Space Group Feature Hooks & Handlers ---
  const [spaceMembers, setSpaceMembers] = useState<any[]>([]);
  const [spacePosts, setSpacePosts] = useState<any[]>([]);
  const [spaceChats, setSpaceChats] = useState<any[]>([]);
  const [allIdentities, setAllIdentities] = useState<any[]>([]);
  const [activeSpaceTab, setActiveSpaceTab] = useState<'feed' | 'chat' | 'members' | 'settings'>('feed');
  
  // Input fields
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentTexts, setNewCommentTexts] = useState<{[postId: string]: string}>({});
  const [newSpaceChatMsg, setNewSpaceChatMsg] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Moderator' | 'Member'>('Member');
  const [isSpaceActionLoading, setIsSpaceActionLoading] = useState(false);

  const loadSpaceData = () => {
    if (!id) return;
    fetch(`/api/spaces/${id}/members`)
      .then(res => res.json())
      .then(data => setSpaceMembers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`/api/spaces/${id}/posts`)
      .then(res => res.json())
      .then(data => setSpacePosts(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`/api/spaces/${id}/chat`)
      .then(res => res.json())
      .then(data => setSpaceChats(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`/api/identities`)
      .then(res => res.json())
      .then(data => setAllIdentities(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (profile && profile.type === 'Organization') {
      loadSpaceData();
    }
  }, [profile, id]);

  const isMember = identity ? spaceMembers.some(m => m.identityId === identity.id) : false;
  const mySpaceRole = identity ? spaceMembers.find(m => m.identityId === identity.id)?.role : null;
  const isAdmin = mySpaceRole === 'Admin';

  const handleJoinSpace = async () => {
    if (!identity || !id) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId: identity.id, role: 'Member' })
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleLeaveSpace = async () => {
    if (!identity || !id) return;
    if (!window.confirm('คุณต้องการออกจากกลุ่ม/สเปซนี้ใช่หรือไม่?')) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/members/${identity.id}`, {
        method: 'DELETE'
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId || !id) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId: inviteUserId, role: inviteRole })
      });
      setInviteUserId('');
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberIdentityId: string) => {
    if (!id) return;
    if (!window.confirm('คุณต้องการลบสมาชิกคนนี้ออกจากกลุ่มใช่หรือไม่?')) return;
    try {
      await fetch(`/api/spaces/${id}/members/${memberIdentityId}`, {
        method: 'DELETE'
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSpacePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !identity || !id) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: identity.id, content: newPostContent })
      });
      setNewPostContent('');
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!identity) return;
    try {
      await fetch(`/api/spaces/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId: identity.id })
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = newCommentTexts[postId];
    if (!commentText || !commentText.trim() || !identity) return;
    try {
      await fetch(`/api/spaces/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: identity.id, content: commentText })
      });
      setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendSpaceChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceChatMsg.trim() || !identity || !id) return;
    try {
      await fetch(`/api/spaces/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: identity.id, content: newSpaceChatMsg })
      });
      setNewSpaceChatMsg('');
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeVisibility = async (newVisibility: 'Public' | 'Private') => {
    if (!id) return;
    try {
      await fetch(`/api/spaces/${id}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility })
      });
      setProfile(prev => prev ? { ...prev, visibility: newVisibility } : null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">{lt.loading}</div>;
  if (!profile) return <div className="py-12 text-center text-red-500">{lt.notFound}</div>;

  if (profile.type === 'Organization') {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 animate-duration-500" id="space-group-profile">
        {/* Banner with cover color */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-48 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 relative p-6 flex flex-col justify-end">
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold">
              {profile.visibility === 'Public' ? (
                <><Globe className="w-4 h-4 text-emerald-400" /> {lt.publicGroup}</>
              ) : (
                <><Lock className="w-4 h-4 text-amber-400" /> {lt.privateGroup}</>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-16 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-3xl border-2 border-white shadow-lg">
                  <Box className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 leading-none">
                    {profile.name}
                    <CheckCircle className="w-5 h-5 text-indigo-400 fill-white animate-bounce" />
                  </h1>
                  <p className="text-sm text-indigo-200 font-mono mt-1.5">{profile.handle}</p>
                </div>
              </div>
              
              <div>
                {isMember ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> {lt.isMember} ({mySpaceRole})
                    </span>
                    <button
                      onClick={handleLeaveSpace}
                      disabled={isSpaceActionLoading}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                    >
                      {lt.leaveSpace}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinSpace}
                    disabled={isSpaceActionLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> {lt.joinSpace}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Info bar */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-6 text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <strong>{spaceMembers.length}</strong> {lt.members}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <strong>{spacePosts.length}</strong> {lt.posts}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-slate-400" />
                {lt.trustScore}: <strong className="text-emerald-600 font-bold">{profile.trustProfile?.identity || 99}%</strong>
              </span>
            </div>
            
            <div className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-md">
              {profile.visibility === 'Public' ? lt.publicDesc : lt.privateDesc}
            </div>
          </div>
        </div>

        {/* Private Warning banner if not a member */}
        {profile.visibility === 'Private' && !isMember ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-md">
            <Lock className="w-16 h-16 text-indigo-600 mx-auto mb-4 p-3 bg-indigo-50 rounded-2xl border border-indigo-100" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{lt.privateWarningTitle}</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              {lt.privateWarningDesc}
            </p>
            <button
              onClick={handleJoinSpace}
              disabled={isSpaceActionLoading}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {lt.joinGroupNow}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Tabs */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">{lt.menu}</h3>
                
                <button
                  onClick={() => setActiveSpaceTab('feed')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeSpaceTab === 'feed'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> {lt.postsTab}
                </button>
                
                <button
                  onClick={() => setActiveSpaceTab('chat')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeSpaceTab === 'chat'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> {lt.chatTab}
                  <span className="ml-auto bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    LIVE
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveSpaceTab('members')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeSpaceTab === 'members'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" /> {lt.membersTab} ({spaceMembers.length})
                </button>
 
                {isAdmin && (
                  <button
                    onClick={() => setActiveSpaceTab('settings')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeSpaceTab === 'settings'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-4 h-4" /> {lt.settingsTab}
                  </button>
                )}
              </div>
 
              {/* Group Rules & Info widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-4 h-4 text-indigo-600" /> {lt.rules}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lt.rulesDesc}
                </p>
              </div>
            </div>
 
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {activeSpaceTab === 'feed' && (
                /* FEED TAB */
                <div className="space-y-6">
                  {/* Create Post Section */}
                  {isMember ? (
                    <form onSubmit={handleCreateSpacePost} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {identity?.name ? identity.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder={lt.postPlaceholder}
                          className="flex-1 min-h-[80px] p-3 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-slate-50/30 text-slate-800"
                          required
                        />
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-xs text-slate-400 font-mono">Workspace Feed</span>
                        <button
                          type="submit"
                          disabled={isSpaceActionLoading || !newPostContent.trim()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> {lt.postButton}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-center">
                      <p className="text-sm text-indigo-700 font-semibold mb-2">{language === 'th' ? 'เฉพาะสมาชิกกลุ่มเท่านั้นที่จะสามารถตั้งโพสต์และแสดงความคิดเห็นได้' : 'Only members can write posts and comment.'}</p>
                      <button
                        onClick={handleJoinSpace}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                      >
                        {lt.joinSpace}
                      </button>
                    </div>
                  )}

                  {/* Posts List */}
                  <div className="space-y-4">
                    {spacePosts.length === 0 ? (
                      <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400">
                        {language === 'th' ? 'ไม่มีโพสต์ในขณะนี้ เริ่มเขียนโพสต์แรกกันเลย!' : 'No posts yet. Start by writing the first post!'}
                      </div>
                    ) : (
                      spacePosts.map((post: any) => {
                        const hasLiked = identity ? post.likes.includes(identity.id) : false;
                        return (
                          <div key={post.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
                            {/* Author details */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                                  {post.author?.type === 'Human' ? '👤' : post.author?.type === 'AI Agent' ? '🤖' : '🏢'}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1">
                                    {post.author?.name || 'Unknown Author'}
                                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                      {post.author?.type}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400 font-mono mt-0.5">{post.author?.handle}</div>
                                </div>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                              {post.content}
                            </p>

                            {/* Actions bar (Like count, comments count) */}
                            <div className="flex items-center gap-4 border-y border-slate-100 py-2.5">
                              <button
                                onClick={() => handleLikePost(post.id)}
                                disabled={!isMember}
                                className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  hasLiked ? 'text-red-600 scale-105' : 'text-slate-500 hover:text-red-500'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-600 text-red-600' : ''}`} />
                                {language === 'th' ? 'ถูกใจ' : 'Like'} ({post.likes?.length || 0})
                              </button>
                              
                              <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                <MessageSquare className="w-4 h-4" />
                                {language === 'th' ? 'ความคิดเห็น' : 'Comments'} ({post.comments?.length || 0})
                              </span>
                            </div>

                            {/* Comments section */}
                            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                              {post.comments?.length > 0 && (
                                <div className="space-y-3">
                                  {post.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-2.5 items-start border-b border-slate-100/60 pb-3 last:border-none last:pb-0">
                                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold border border-slate-300">
                                        {comment.author?.type === 'Human' ? '👤' : '🤖'}
                                      </div>
                                      <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs text-xs">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-extrabold text-slate-900">
                                            {comment.author?.name}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-mono">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                          </span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed font-medium">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Comment Form */}
                              {isMember ? (
                                <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-2">
                                  <input
                                    type="text"
                                    required
                                    placeholder={lt.commentPlaceholder}
                                    value={newCommentTexts[post.id] || ''}
                                    onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white text-slate-800"
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                                  >
                                    {lt.send}
                                  </button>
                                </form>
                              ) : (
                                <p className="text-[10px] text-slate-400 font-bold text-center">{language === 'th' ? 'เฉพาะสมาชิกที่เข้าร่วมกลุ่มเท่านั้นที่จะแสดงความเห็นได้' : 'Only space members can comment.'}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeSpaceTab === 'chat' && (
                /* GROUP CHAT TAB */
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row h-[600px]">
                  {/* Chat users listing (Sidebar within chat) */}
                  <div className="w-full md:w-60 border-r border-slate-100 bg-slate-50/60 p-4 flex flex-col">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 px-1 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {language === 'th' ? 'สมาชิกที่คุยล่าสุด' : 'Recent Active Members'}
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {spaceMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-150">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-sm font-bold">
                            {m.identity?.type === 'Human' ? '👤' : '🤖'}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-slate-900 truncate leading-tight">{m.identity?.name}</div>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">{m.identity?.handle}</div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto animate-pulse"></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat messages viewport */}
                  <div className="flex-1 flex flex-col h-full bg-white">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{language === 'th' ? 'ห้องแชทสเปซเรียลไทม์ (Live Workspace Chat)' : 'Live Workspace Chat'}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{language === 'th' ? 'การสนทนาที่ถูกตรวจสอบผ่านโมเดลตรวจสอบของกลุ่ม' : 'Conversations monitored through verification models'}</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                        Secure Connection
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50/20 space-y-4 flex flex-col">
                      {spaceChats.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 text-xs">
                          {language === 'th' ? 'ห้องแชทเงียบเหงาจัง... พิมพ์อะไรบางอย่างเพื่อเริ่มคุยกันเลย!' : 'The chat room is empty... Type something to start talking!'}
                        </div>
                      ) : (
                        spaceChats.map((chat: any) => {
                          const isSelfMsg = chat.senderId === identity?.id;
                          return (
                            <div key={chat.id} className={`flex gap-2.5 ${isSelfMsg ? 'flex-row-reverse' : 'items-start'}`}>
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold border border-indigo-200">
                                {chat.sender?.type === 'Human' ? '👤' : '🤖'}
                              </div>
                              <div className={`max-w-[70%] ${isSelfMsg ? 'text-right' : ''}`}>
                                <div className="text-[10px] font-bold text-slate-500 font-mono mb-1">
                                  {chat.sender?.name}
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium shadow-xs leading-relaxed inline-block text-left ${
                                  isSelfMsg 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                }`}>
                                  {chat.content}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono mt-1 block">
                                  {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input */}
                    {isMember ? (
                      <form onSubmit={handleSendSpaceChatMessage} className="p-3 border-t border-slate-100 flex gap-2">
                        <input
                          type="text"
                          required
                          value={newSpaceChatMsg}
                          onChange={(e) => setNewSpaceChatMsg(e.target.value)}
                          placeholder={lt.chatPlaceholder}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> {lt.send}
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 text-center border-t border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">
                        {language === 'th' ? 'เฉพาะสมาชิกกลุ่มเท่านั้นที่จะแชทได้ในห้องนี้' : 'Only space members can chat in this room.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSpaceTab === 'members' && (
                /* MEMBERS LIST TAB */
                <div className="space-y-6">
                  {/* Search and Invite member (Admin Only) */}
                  {isAdmin && (
                    <form onSubmit={handleInviteMember} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-indigo-600" /> {lt.addMemberTitle}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {lt.addMemberDesc}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          required
                          value={inviteUserId}
                          onChange={(e) => setInviteUserId(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        >
                          <option value="">-- {language === 'th' ? 'เลือกผู้ใช้ที่จะดึงเข้ากลุ่ม' : 'Select user to add'} --</option>
                          {allIdentities
                            .filter(id => id.id !== profile.id && !spaceMembers.some(m => m.identityId === id.id))
                            .map(id => (
                              <option key={id.id} value={id.id}>
                                {id.name} ({id.handle} • {id.type})
                              </option>
                            ))}
                        </select>

                        <select
                          value={inviteRole}
                          onChange={(e: any) => setInviteRole(e.target.value)}
                          className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-800"
                        >
                          <option value="Member">Member</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Admin">Admin</option>
                        </select>

                        <button
                          type="submit"
                          disabled={isSpaceActionLoading || !inviteUserId}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
                        >
                          {lt.addMemberBtn}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Member grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spaceMembers.map((member: any) => (
                      <div key={member.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg border border-slate-350">
                            {member.identity?.type === 'Human' ? '👤' : '🤖'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              {member.identity?.name}
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                                {member.role}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{member.identity?.handle}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            Joined {formatDistanceToNow(new Date(member.joinedAt))} ago
                          </span>

                          {isAdmin && member.identityId !== identity?.id && (
                            <button
                              onClick={() => handleRemoveMember(member.identityId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title={language === 'th' ? 'ลบสมาชิก' : 'Remove member'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSpaceTab === 'settings' && isAdmin && (
                /* SPACE SETTINGS TAB (Admin Only) */
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" /> {language === 'th' ? 'ตั้งค่าสเปซกลุ่มความร่วมมือ (Space Settings)' : 'Space Settings'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'th' ? 'จัดการการเข้าถึง ความเป็นส่วนตัว และระเบียบความปลอดภัยภายในกลุ่มสเปซ' : 'Manage access, privacy, and security regulations within the group space'}
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{language === 'th' ? 'เปลี่ยนประเภทความเป็นส่วนตัว (Privacy Mode)' : 'Change Privacy Mode'}</h5>
                        <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                          {language === 'th' ? 'หากตั้งเป็น ส่วนตัว (Private) คนนอกกลุ่มจะไม่เห็นโพสต์ ข้อมูลสมาชิก และแชทกลุ่ม จะเห็นได้เฉพาะชื่อและประวัติตั้งต้นเท่านั้น' : 'If set to Private, non-members will not see posts, member details, or chat. Only public name and handle will be visible.'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChangeVisibility('Public')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            profile.visibility === 'Public'
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Public
                        </button>
                        <button
                          onClick={() => handleChangeVisibility('Private')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            profile.visibility === 'Private'
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Private
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200">
                      <h5 className="text-sm font-bold text-slate-900 mb-2">{language === 'th' ? 'ข้อมูลผู้สร้าง (Owner Metadata)' : 'Owner Metadata'}</h5>
                      <div className="text-xs text-slate-500 font-mono space-y-1">
                        <div>{language === 'th' ? 'สเปซ ID' : 'Space ID'}: {profile.id}</div>
                        <div>{language === 'th' ? 'แฮนเดิลอ้างอิง' : 'Handle'}: {profile.handle}</div>
                        <div>{language === 'th' ? 'บทบาทของคุณ: Admin ของกลุ่ม' : 'Your Role: Group Admin'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const getIdentityIcon = (type: string, className = "w-6 h-6") => {
    switch (type) {
      case 'Human': return <User className={className} />;
      case 'Organization': return <Box className={className} />;
      case 'AI Agent': return <Bot className={className} />;
      default: return <User className={className} />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Knowledge Published': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'Badge Award': return <Award className="w-4 h-4 text-amber-500" />;
      case 'Verification': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[100rem] mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-16 mb-6">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1.5 shadow-md">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  {getIdentityIcon(profile.type, "w-12 h-12")}
                </div>
              </div>
              <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight flex items-center gap-2">
                  {profile.name}
                  {profile.verifications.length > 0 && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </h1>
                <div className="text-sm font-mono text-slate-500 mt-1">{profile.handle}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {identity && identity.id !== id && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      isFollowing
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isFollowLoading ? '...' : isFollowing ? lt.following : lt.follow}
                  </button>
                  {isFollowing && (
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] uppercase font-bold text-slate-500 border-l border-slate-200 pl-2">
                      <input
                        type="checkbox"
                        checked={notifyAll}
                        onChange={(e) => handleNotifyAllToggle(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-1"
                      />
                      {language === 'th' ? 'แจ้งเตือนทั้งหมด' : 'Notify All'}
                    </label>
                  )}
                </div>
              )}
              
              {identity && identity.id !== id && (
                <button 
                  onClick={() => setIsMessageModalOpen(true)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {lt.sendMessage}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{lt.type}: <strong className="text-slate-900">{profile.type}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>{lt.visibility || 'Visibility'}: <strong className="text-slate-900">{profile.visibility}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.human.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">{lt.humanFollowers}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.ai.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">{lt.aiFollowers}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.organization.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">{lt.organizations}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.enterprise.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">{lt.enterprise}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.roles.map(role => (
              <span key={role} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Trust & Reputation */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Trust Profile */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" /> {lt.trustProfile}
            </h2>
            <div className="space-y-4">
              {Object.entries(profile.trustProfile).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    <span>{key}</span>
                    <span className="text-slate-900">{value}/100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges & Verifications */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> {language === 'th' ? 'การรับรองและเกียรติบัตร' : 'Verifications & Badges'}
            </h2>
            
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{lt.verifications}</h3>
              <div className="flex flex-col gap-2">
                {profile.verifications.map(v => (
                  <div key={v} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <CheckCircle className="w-4 h-4 text-blue-500" /> {v}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{lt.badges}</h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map(b => (
                  <div key={b} className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
                    <Award className="w-3.5 h-3.5" /> {b}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Reputation Dimensions, Expertise & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Reputation Dimensions */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" /> {lt.reputation}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(profile.reputation).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-2xl font-black text-slate-900 mb-1">{value.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Expertise Graph */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" /> {lt.expertise}
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile.expertise.map((exp, idx) => (
                <Link
                  key={idx}
                  to={`/explore/tags?tab=entities&select=${encodeURIComponent(exp.topic)}`}
                  className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 hover:bg-purple-50/10 px-4 py-2.5 rounded-lg transition-all group cursor-pointer"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-purple-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                    {exp.topic}
                  </div>
                  <div className="h-4 w-px bg-slate-200"></div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded group-hover:bg-purple-100 transition-colors">
                    {exp.level}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-600" /> {language === 'th' ? 'ประวัติกิจกรรมความโปร่งใส' : 'Transparent Activity Timeline'}
            </h2>
            <div className="space-y-6">
              {activities.length === 0 ? (
                <div className="text-sm text-slate-500">{language === 'th' ? 'ยังไม่มีประวัติกิจกรรมบันทึกไว้' : 'No activity recorded yet.'}</div>
              ) : (
                activities.map((activity, idx) => (
                  <div key={activity.id} className="relative pl-6">
                    {/* Timeline Line */}
                    {idx !== activities.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-slate-200"></div>
                    )}
                    {/* Dot */}
                    <div className="absolute left-0 top-1.5 w-[22px] h-[22px] bg-white border-2 border-slate-200 rounded-full flex items-center justify-center z-10">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="mb-1 text-sm font-semibold text-slate-900">
                      {activity.type}
                    </div>
                    <div className="text-sm text-slate-600 mb-1">
                      {activity.description}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {format(new Date(activity.timestamp), 'PPpp')} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Private Messages Overlay Dialog */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col h-[500px] overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  {getIdentityIcon(profile.type, "w-4 h-4 text-slate-500")}
                  {language === 'th' ? `ส่งข้อความส่วนตัวถึง ${profile.name}` : `Direct Message with ${profile.name}`}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{profile.handle}</p>
              </div>
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-all"
              >
                {language === 'th' ? 'ปิด' : 'Close'}
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {language === 'th' ? 'ยังไม่มีประวัติการพูดคุย ส่งข้อความส่วนตัวที่ปลอดภัยเพื่อเริ่มต้น!' : 'No conversation history. Send a secure direct message to start!'}
                </div>
              ) : (
                messages.map((m: any) => {
                  const isSelf = m.senderId === identity?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs font-medium shadow-xs leading-relaxed ${
                        isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                        {formatDistanceToNow(new Date(m.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
              <input
                required
                type="text"
                placeholder={language === 'th' ? 'พิมพ์ข้อความของคุณ...' : 'Type your message...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSendingMessage ? '...' : (language === 'th' ? 'ส่ง' : 'Send')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
