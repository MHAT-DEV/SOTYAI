import { useState, useEffect } from 'react';
import { Account, Session, Identity } from '../types';
import { Shield, Key, Monitor, Smartphone, Globe, LogOut, CheckCircle2, User, Users, Bot, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

const localTranslations: Record<string, Record<string, string>> = {
  th: {
    loading: 'กำลังโหลดการตั้งค่า...',
    title: 'การตั้งค่าบัญชี',
    subtitle: 'จัดการการตรวจสอบสิทธิ์ เซสชัน และโปรไฟล์ของคุณ',
    authenticatedAs: 'ยืนยันตัวตนในชื่อ',
    security: 'ความปลอดภัย',
    identities: 'ข้อมูลประจำตัว',
    sessions: 'เซสชัน',
    authMethods: 'วิธีการรับรองความถูกต้อง',
    authMethodsSub: 'กำหนดค่าวิธีการลงชื่อเข้าใช้บัญชีของคุณ',
    passkeyTitle: 'คีย์ความปลอดภัย (Passkey / WebAuthn)',
    passkeySub: 'ลงชื่อเข้าใช้อย่างปลอดภัยด้วยการยืนยันตัวตนแบบไบโอเมตริกซ์',
    enabled: 'เปิดใช้งานแล้ว',
    setUp: 'ตั้งค่า',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'ลงชื่อเข้าใช้ด้วยบัญชี GitHub ของคุณ',
    connect: 'เชื่อมต่อ',
    twoFactor: 'การรับรองความถูกต้องแบบสองปัจจัย (2FA)',
    twoFactorSub: 'เพิ่มการรักษาความปลอดภัยอีกชั้นให้กับบัญชีของคุณ',
    enable2fa: 'เปิดใช้งาน 2FA',
    identitiesSub: 'บัญชีนี้เป็นเจ้าของข้อมูลประจำตัวต่อไปนี้ การดำเนินการบนแพลตฟอร์มจะทำโดยข้อมูลประจำตัวปัจจุบัน',
    createIdentity: 'สร้างข้อมูลประจำตัว',
    switchTo: 'สลับไปยัง',
    manage: 'จัดการ',
    activeSessions: 'เซสชันที่มีผลอยู่',
    sessionsSub: 'จัดการอุปกรณ์ที่เข้าสู่ระบบบัญชีของคุณ',
    signOutOther: 'ออกจากระบบอุปกรณ์อื่นๆ ทั้งหมด',
    thisDevice: 'อุปกรณ์นี้',
    lastActive: 'ใช้งานล่าสุด:'
  },
  en: {
    loading: 'Loading settings...',
    title: 'Account Settings',
    subtitle: 'Manage your authentication, sessions, and identities.',
    authenticatedAs: 'Authenticated As',
    security: 'Security',
    identities: 'Identities',
    sessions: 'Sessions',
    authMethods: 'Authentication Methods',
    authMethodsSub: 'Configure how you sign in to your account.',
    passkeyTitle: 'Passkeys (WebAuthn)',
    passkeySub: 'Sign in securely with biometric authentication.',
    enabled: 'Enabled',
    setUp: 'Set Up',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'Sign in using your GitHub account.',
    connect: 'Connect',
    twoFactor: 'Two-Factor Authentication',
    twoFactorSub: 'Add an extra layer of security to your account.',
    enable2fa: 'Enable 2FA',
    identitiesSub: 'This account owns the following identities. Actions on the platform are performed by the active identity.',
    createIdentity: 'Create Identity',
    switchTo: 'Switch To',
    manage: 'Manage',
    activeSessions: 'Active Sessions',
    sessionsSub: 'Manage devices logged into your account.',
    signOutOther: 'Sign Out All Other Devices',
    thisDevice: 'This Device',
    lastActive: 'Last active:'
  },
  ja: {
    loading: '設定を読み込み中...',
    title: 'アカウント設定',
    subtitle: '認証、セッション、ID情報を管理します。',
    authenticatedAs: '認証済みアカウント',
    security: 'セキュリティ',
    identities: 'ID情報',
    sessions: 'セッション',
    authMethods: '認証方法',
    authMethodsSub: 'アカウントへのサインイン方法を設定します。',
    passkeyTitle: 'パスキー (WebAuthn)',
    passkeySub: '生体認証を使用して安全にサインインします。',
    enabled: '有効化済み',
    setUp: 'セットアップ',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'GitHubアカウントを使用してサインインします。',
    connect: '連携する',
    twoFactor: '2要素認証 (2FA)',
    twoFactorSub: 'アカウントのセキュリティ層をさらに強化します。',
    enable2fa: '2FAを有効にする',
    identitiesSub: 'このアカウントは以下のIDを所有しています。プラットフォーム上での活動は、アクティブなIDにより実行されます。',
    createIdentity: 'IDを作成',
    switchTo: '切り替える',
    manage: '管理',
    activeSessions: 'アクティブなセッション',
    sessionsSub: 'ログイン中のデバイスを管理します。',
    signOutOther: '他のすべてのデバイスからログアウト',
    thisDevice: 'このデバイス',
    lastActive: '最終アクティビティ:'
  },
  zh: {
    loading: '正在加载设置...',
    title: '账号设置',
    subtitle: '管理您的身份验证、会话和身份信息。',
    authenticatedAs: '已认证身份',
    security: '安全设置',
    identities: '身份列表',
    sessions: '活跃会话',
    authMethods: '身份验证方法',
    authMethodsSub: '配置您登录账户的方式。',
    passkeyTitle: '通行密钥 (Passkey / WebAuthn)',
    passkeySub: '使用生物识别安全登录。',
    enabled: '已启用',
    setUp: '立即设置',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: '使用您的 GitHub 账号登录。',
    connect: '连接绑定',
    twoFactor: '双重身份验证 (2FA)',
    twoFactorSub: '为您的账户增加额外安全保障。',
    enable2fa: '启用 2FA',
    identitiesSub: '此账户拥有以下身份。平台操作将由当前的活动身份执行。',
    createIdentity: '创建新身份',
    switchTo: '切换至此',
    manage: '管理身份',
    activeSessions: '活跃中的会话',
    sessionsSub: '管理已登录您账户的设备。',
    signOutOther: '注销其他所有设备',
    thisDevice: '当前设备',
    lastActive: '最后活跃时间:'
  },
  ko: {
    loading: '설정 로드 중...',
    title: '계정 설정',
    subtitle: '인증, 세션 및 연동된 ID를 관리합니다.',
    authenticatedAs: '인증된 이메일',
    security: '보안',
    identities: '계정 ID 리스트',
    sessions: '접속 세션',
    authMethods: '사용자 인증 방법',
    authMethodsSub: '계정 로그인 방식을 구성합니다.',
    passkeyTitle: '패스키 (Passkey / WebAuthn)',
    passkeySub: '생체 인식을 사용하여 안전하게 로그인합니다.',
    enabled: '활성화됨',
    setUp: '설정하기',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'GitHub 계정을 사용하여 로그인합니다.',
    connect: '연동하기',
    twoFactor: '2단계 인증 (2FA)',
    twoFactorSub: '계정에 보안 단계를 추가로 구성합니다.',
    enable2fa: '2FA 활성화',
    identitiesSub: '이 계정은 다음 ID들을 소유합니다. 플랫폼 내 활동은 현재 활성화된 ID로 처리됩니다.',
    createIdentity: 'ID 신규 생성',
    switchTo: '이 ID로 전환',
    manage: 'ID 관리',
    activeSessions: '활성화된 로그인 세션',
    sessionsSub: '계정에 로그인된 디바이스들을 관리합니다.',
    signOutOther: '다른 모든 기기에서 로그아웃',
    thisDevice: '현재 기기',
    lastActive: '마지막 활동:'
  },
  de: {
    loading: 'Einstellungen werden geladen...',
    title: 'Kontoeinstellungen',
    subtitle: 'Verwalten Sie Ihre Authentifizierung, Sitzungen und Identitäten.',
    authenticatedAs: 'Authentifiziert als',
    security: 'Sicherheit',
    identities: 'Identitäten',
    sessions: 'Sitzungen',
    authMethods: 'Authentifizierungsmethoden',
    authMethodsSub: 'Konfigurieren Sie, wie Sie sich bei Ihrem Konto anmelden.',
    passkeyTitle: 'Passkeys (WebAuthn)',
    passkeySub: 'Melden Sie sich sicher mit biometrischer Authentifizierung an.',
    enabled: 'Aktiviert',
    setUp: 'Einrichten',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'Melden Sie sich mit Ihrem GitHub-Konto an.',
    connect: 'Verbinden',
    twoFactor: 'Zwei-Faktor-Authentifizierung (2FA)',
    twoFactorSub: 'Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsstufe hinzu.',
    enable2fa: '2FA aktivieren',
    identitiesSub: 'Dieses Konto besitzt die folgenden Identitäten. Aktionen auf der Plattform werden von der aktiven Identität ausgeführt.',
    createIdentity: 'Identität erstellen',
    switchTo: 'Wechseln zu',
    manage: 'Verwalten',
    activeSessions: 'Aktive Sitzungen',
    sessionsSub: 'Verwalten Sie die bei Ihrem Konto angemeldeten Geräte.',
    signOutOther: 'Alle anderen Geräte abmelden',
    thisDevice: 'Dieses Gerät',
    lastActive: 'Zuletzt aktiv:'
  },
  fr: {
    loading: 'Chargement des paramètres...',
    title: 'Paramètres du Compte',
    subtitle: 'Gérez votre authentification, vos sessions et vos identités.',
    authenticatedAs: 'Authentifié en tant que',
    security: 'Sécurité',
    identities: 'Identités',
    sessions: 'Sessions',
    authMethods: 'Méthodes d\'Authentification',
    authMethodsSub: 'Configurez la manière dont vous vous connectez à votre compte.',
    passkeyTitle: 'Clés d\'accès (Passkeys / WebAuthn)',
    passkeySub: 'Connectez-vous en toute sécurité grâce à l\'authentification biométrique.',
    enabled: 'Activé',
    setUp: 'Configurer',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'Connectez-vous à l\'aide de votre compte GitHub.',
    connect: 'Connecter',
    twoFactor: 'Authentification à double facteur (2FA)',
    twoFactorSub: 'Ajoutez une couche de sécurité supplémentaire à votre compte.',
    enable2fa: 'Activer la 2FA',
    identitiesSub: 'Ce compte détient les identités suivantes. Les actions sur la plateforme sont effectuées sous l\'identité active.',
    createIdentity: 'Créer une Identité',
    switchTo: 'Basculer vers',
    manage: 'Gérer',
    activeSessions: 'Sessions Actives',
    sessionsSub: 'Gérez les appareils connectés à votre compte.',
    signOutOther: 'Déconnecter tous les autres appareils',
    thisDevice: 'Cet appareil',
    lastActive: 'Dernière activité :'
  },
  es: {
    loading: 'Cargando configuraciones...',
    title: 'Configuración de la Cuenta',
    subtitle: 'Administre su autenticación, sesiones e identidades.',
    authenticatedAs: 'Autenticado como',
    security: 'Seguridad',
    identities: 'Identidades',
    sessions: 'Sesiones',
    authMethods: 'Métodos de Autenticación',
    authMethodsSub: 'Configure cómo inicia sesión en su cuenta.',
    passkeyTitle: 'Llaves de paso (Passkeys / WebAuthn)',
    passkeySub: 'Inicie sesión de forma segura con autenticación biométrica.',
    enabled: 'Habilitado',
    setUp: 'Configurar',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'Inicie sesión con su cuenta de GitHub.',
    connect: 'Conectar',
    twoFactor: 'Autenticación de dos factores (2FA)',
    twoFactorSub: 'Agregue una capa adicional de seguridad a su cuenta.',
    enable2fa: 'Habilitar 2FA',
    identitiesSub: 'Esta cuenta posee las siguientes identidades. Las acciones en la plataforma se realizan con la identidad activa.',
    createIdentity: 'Crear Identidad',
    switchTo: 'Cambiar a',
    manage: 'Administrar',
    activeSessions: 'Sesiones Activas',
    sessionsSub: 'Administre los dispositivos conectados a su cuenta.',
    signOutOther: 'Cerrar sesión en los demás dispositivos',
    thisDevice: 'Este dispositivo',
    lastActive: 'Última actividad:'
  },
  ru: {
    loading: 'Загрузка настроек...',
    title: 'Настройки учетной записи',
    subtitle: 'Управление аутентификацией, сессиями и профилями.',
    authenticatedAs: 'Вошел как',
    security: 'Безопасность',
    identities: 'Профили',
    sessions: 'Сессии',
    authMethods: 'Методы авторизации',
    authMethodsSub: 'Настройте способы входа в аккаунт.',
    passkeyTitle: 'Ключи доступа (Passkeys / WebAuthn)',
    passkeySub: 'Безопасный вход с помощью биометрии.',
    enabled: 'Включено',
    setUp: 'Настроить',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'Вход с использованием аккаунта GitHub.',
    connect: 'Подключить',
    twoFactor: 'Двухфакторная аутентификация (2FA)',
    twoFactorSub: 'Дополнительный уровень безопасности для вашего аккаунта.',
    enable2fa: 'Включить 2FA',
    identitiesSub: 'Этот аккаунт владеет следующими профилями. Действия на платформе совершаются под активным профилем.',
    createIdentity: 'Создать профиль',
    switchTo: 'Переключиться',
    manage: 'Управление',
    activeSessions: 'Активные сессии',
    sessionsSub: 'Управление устройствами, выполнившими вход в ваш аккаунт.',
    signOutOther: 'Выйти на всех остальных устройствах',
    thisDevice: 'Это устройство',
    lastActive: 'Последняя активность:'
  },
  vi: {
    loading: 'Đang tải cài đặt...',
    title: 'Cài đặt tài khoản',
    subtitle: 'Quản lý xác thực, phiên làm việc và danh tính liên kết.',
    authenticatedAs: 'Đã xác thực là',
    security: 'Bảo mật',
    identities: 'Danh tính',
    sessions: 'Phiên làm việc',
    authMethods: 'Phương thức xác thực',
    authMethodsSub: 'Cấu hình cách bạn đăng nhập vào tài khoản của mình.',
    passkeyTitle: 'Khóa bảo mật (Passkey / WebAuthn)',
    passkeySub: 'Đăng nhập an toàn bằng xác thực sinh trắc học.',
    enabled: 'Đã bật',
    setUp: 'Thiết lập',
    oauthGithub: 'OAuth (GitHub)',
    oauthGithubSub: 'Đăng nhập bằng tài khoản GitHub của bạn.',
    connect: 'Kết nối',
    twoFactor: 'Xác thực hai yếu tố (2FA)',
    twoFactorSub: 'Thêm một lớp bảo mật bổ sung cho tài khoản của bạn.',
    enable2fa: 'Kích hoạt 2FA',
    identitiesSub: 'Tài khoản này sở hữu các danh tính sau. Các hành động trên nền tảng được thực hiện bởi danh tính đang hoạt động.',
    createIdentity: 'Tạo danh tính',
    switchTo: 'Chuyển sang',
    manage: 'Quản lý',
    activeSessions: 'Phiên hoạt động',
    sessionsSub: 'Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn.',
    signOutOther: 'Đăng xuất tất cả các thiết bị khác',
    thisDevice: 'Thiết bị này',
    lastActive: 'Hoạt động lần cuối:'
  }
};

export default function AccountSettings() {
  const { language } = useLanguage();
  const lt = localTranslations[language] || localTranslations['en'];

  const [account, setAccount] = useState<Account | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'security' | 'identities' | 'sessions'>('security');

  const fetchData = () => {
    Promise.all([
      fetch('/api/accounts/acc_1').then(r => r.json()),
      fetch('/api/accounts/acc_1/sessions').then(r => r.json()),
      fetch('/api/identities').then(r => r.json())
    ]).then(([accData, sessData, idData]) => {
      setAccount(accData);
      setSessions(sessData);
      setIdentities(idData.filter((i: Identity) => i.accountId === 'acc_1'));
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateIdentity = async () => {
    await fetch('/api/identities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'Human', 
        name: 'New Persona', 
        handle: `@persona_${Math.random().toString(36).substring(7)}`,
        accountId: 'acc_1',
        visibility: 'Public',
        roles: ['Contributor']
      })
    });
    fetchData();
  };

  const handleClearOtherSessions = async () => {
    const currentSession = sessions.find(s => s.isCurrent);
    if (!currentSession) return;
    
    await fetch('/api/accounts/acc_1/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSessionId: currentSession.id })
    });
    fetchData();
  };

  if (loading || !account) return <div className="py-12 text-center">{lt.loading}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{lt.title}</h1>
          <p className="text-slate-500 mt-2">{lt.subtitle}</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{lt.authenticatedAs}</p>
          <p className="text-sm font-bold text-slate-800">{account.email}</p>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-max">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'security' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Shield className="w-4 h-4" /> {lt.security}
        </button>
        <button
          onClick={() => setActiveTab('identities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'identities' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Users className="w-4 h-4" /> {lt.identities}
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'sessions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Monitor className="w-4 h-4" /> {lt.sessions}
        </button>
      </div>

      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{lt.authMethods}</h3>
              <p className="text-sm text-slate-500">{lt.authMethodsSub}</p>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{lt.passkeyTitle}</h4>
                    <p className="text-sm text-slate-500">{lt.passkeySub}</p>
                  </div>
                </div>
                {account.authMethods.includes('Passkey') ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="w-4 h-4" /> {lt.enabled}
                  </span>
                ) : (
                  <button className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">{lt.setUp}</button>
                )}
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{lt.oauthGithub}</h4>
                    <p className="text-sm text-slate-500">{lt.oauthGithubSub}</p>
                  </div>
                </div>
                {account.authMethods.includes('GitHub') ? (
                   <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                   <CheckCircle2 className="w-4 h-4" /> {lt.enabled}
                 </span>
                ) : (
                  <button className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">{lt.connect}</button>
                )}
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{lt.twoFactor}</h4>
                    <p className="text-sm text-slate-500">{lt.twoFactorSub}</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">{lt.enable2fa}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'identities' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="flex justify-between items-center mb-4">
            <p className="text-slate-600">{lt.identitiesSub}</p>
            <button onClick={handleCreateIdentity} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
              <UserPlus className="w-4 h-4" /> {lt.createIdentity}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {identities.map(identity => (
              <div key={identity.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">
                      {identity.type === 'Human' ? <User className="w-6 h-6" /> : identity.type === 'Organization' ? <Users className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                      {identity.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{identity.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{identity.handle}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">{lt.switchTo}</button>
                  <button className="flex-1 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">{lt.manage}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{lt.activeSessions}</h3>
                <p className="text-sm text-slate-500">{lt.sessionsSub}</p>
              </div>
              <button onClick={handleClearOtherSessions} className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                {lt.signOutOther}
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {sessions.map(session => (
                <div key={session.id} className="p-6 flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                      {session.device.includes('iPhone') || session.device.includes('Mobile') ? (
                        <Smartphone className="w-5 h-5 text-slate-600" />
                      ) : (
                        <Monitor className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        {session.device}
                        {session.isCurrent && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">{lt.thisDevice}</span>
                        )}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">{session.browser}</p>
                      <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span>IP: {session.ip}</span>
                        <span>Location: {session.location}</span>
                        <span>{lt.lastActive} {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Log out session">
                      <LogOut className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
