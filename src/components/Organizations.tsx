import { useState, useEffect } from 'react';
import { Box, Shield, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Identity } from '../types';
import { useLanguage } from '../context/LanguageContext';

const localTranslations: Record<string, Record<string, string>> = {
  th: {
    loading: 'กำลังโหลดข้อมูลองค์กร...',
    title: 'กลุ่มความร่วมมือขององค์กร',
    desc: 'พื้นที่ทำงานร่วมกันสำหรับทีมและองค์กรที่ได้รับการตรวจสอบ',
    createBtn: 'สร้างพื้นที่องค์กร',
    noOrgs: 'ไม่พบข้อมูลองค์กร',
    noOrgsDesc: 'สร้างพื้นที่องค์กรแห่งแรกของคุณเพื่อทำงานร่วมกับทีมงานของคุณ',
    members: 'สมาชิก',
    trust: 'ความเชื่อมั่น',
    role: 'บทบาท',
    enterSpace: 'เข้าสู่พื้นที่',
    promptName: 'ระบุชื่อองค์กรใหม่ของคุณ:'
  },
  en: {
    loading: 'Loading organizations...',
    title: 'Organization Spaces',
    desc: 'Collaborative environments for your teams and verified organizations.',
    createBtn: 'Create Organization',
    noOrgs: 'No Organizations Found',
    noOrgsDesc: 'Create your first organization space to collaborate with your team.',
    members: 'Members',
    trust: 'Trust',
    role: 'Role',
    enterSpace: 'Enter Space',
    promptName: 'Enter new organization name:'
  },
  ja: {
    loading: '組織情報を読み込み中...',
    title: '組織スペース',
    desc: 'チームや検証済み組織のための共同作業環境。',
    createBtn: '組織を作成する',
    noOrgs: '組織が見つかりません',
    noOrgsDesc: '最初の組織スペースを作成して、チームと共同作業を開始しましょう。',
    members: 'メンバー',
    trust: '信頼度',
    role: '役割',
    enterSpace: 'スペースに入る',
    promptName: '新しい組織名を入力してください:'
  },
  zh: {
    loading: '正在加载组织列表...',
    title: '组织空间',
    desc: '为您的团队及已验证组织提供的协作环境。',
    createBtn: '创建组织',
    noOrgs: '未找到任何组织',
    noOrgsDesc: '创建您的第一个组织空间以便和团队展开协作。',
    members: '成员',
    trust: '信誉值',
    role: '角色',
    enterSpace: '进入空间',
    promptName: '输入新组织名称:'
  },
  ko: {
    loading: '기관 정보를 불러오는 중...',
    title: '기관 공동 공간',
    desc: '귀하의 팀과 검증된 기관을 위한 협업 환경입니다.',
    createBtn: '기관 생성',
    noOrgs: '기관을 찾을 수 없습니다',
    noOrgsDesc: '팀과 협업할 첫 번째 기관 공동 공간을 만들어보세요.',
    members: '구성원',
    trust: '신뢰',
    role: '역할',
    enterSpace: '공간 입장',
    promptName: '새 기관 이름을 입력하세요:'
  },
  de: {
    loading: 'Organisationen werden geladen...',
    title: 'Organisationsbereiche',
    desc: 'Kollaborative Umgebungen für Ihre Teams und verifizierte Organisationen.',
    createBtn: 'Organisation erstellen',
    noOrgs: 'Keine Organisationen gefunden',
    noOrgsDesc: 'Erstellen Sie Ihren ersten Organisationsbereich, um mit Ihrem Team zusammenzuarbeiten.',
    members: 'Mitglieder',
    trust: 'Vertrauen',
    role: 'Rolle',
    enterSpace: 'Bereich betreten',
    promptName: 'Geben Sie den Namen der neuen Organisation ein:'
  },
  fr: {
    loading: 'Chargement des organisations...',
    title: 'Espaces d\'Organisation',
    desc: 'Environnements collaboratifs pour vos équipes et organisations vérifiées.',
    createBtn: 'Créer une organisation',
    noOrgs: 'Aucune organisation trouvée',
    noOrgsDesc: 'Créez votre premier espace d\'organisation pour collaborer avec votre équipe.',
    members: 'Membres',
    trust: 'Confiance',
    role: 'Rôle',
    enterSpace: 'Accéder à l\'espace',
    promptName: 'Saisissez le nom de la nouvelle organisation :'
  },
  es: {
    loading: 'Cargando organizaciones...',
    title: 'Espacios de Organización',
    desc: 'Entornos colaborativos para sus equipos y organizaciones verificadas.',
    createBtn: 'Crear Organización',
    noOrgs: 'No se encontraron organizaciones',
    noOrgsDesc: 'Cree su primer espacio de organización para colaborar con su equipo.',
    members: 'Miembros',
    trust: 'Confianza',
    role: 'Rol',
    enterSpace: 'Entrar al Espacio',
    promptName: 'Ingrese el nombre de la nueva organización:'
  },
  ru: {
    loading: 'Загрузка организаций...',
    title: 'Пространства организаций',
    desc: 'Совместная среда для ваших команд и проверенных организаций.',
    createBtn: 'Создать организацию',
    noOrgs: 'Организации не найдены',
    noOrgsDesc: 'Создайте свое первое пространство организации для совместной работы.',
    members: 'Участники',
    trust: 'Доверие',
    role: 'Роль',
    enterSpace: 'Войти в пространство',
    promptName: 'Введите название новой организации:'
  },
  vi: {
    loading: 'Đang tải tổ chức...',
    title: 'Không gian Tổ chức',
    desc: 'Môi trường hợp tác cho nhóm của bạn và các tổ chức đã xác minh.',
    createBtn: 'Tạo tổ chức',
    noOrgs: 'Không tìm thấy tổ chức nào',
    noOrgsDesc: 'Tạo không gian tổ chức đầu tiên của bạn để cộng tác với nhóm của bạn.',
    members: 'Thành viên',
    trust: 'Tin cậy',
    role: 'Vai trò',
    enterSpace: 'Vào không gian',
    promptName: 'Nhập tên tổ chức mới:'
  }
};

interface OrganizationsProps {
  identity?: Identity | null;
}

export default function Organizations({ identity }: OrganizationsProps) {
  const { language } = useLanguage();
  const lt = localTranslations[language] || localTranslations['en'];

  const [organizations, setOrganizations] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = () => {
    fetch('/api/identities')
      .then(r => r.json())
      .then((data: Identity[]) => {
        setOrganizations(data.filter(i => i.type === 'Organization'));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrganization = async () => {
    const name = window.prompt(lt.promptName);
    if (!name) return;

    setLoading(true);
    await fetch('/api/identities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'Organization', 
        name, 
        handle: `@${name.toLowerCase().replace(/\s+/g, '_')}`,
        accountId: 'acc_1',
        visibility: 'Public',
        roles: ['Organization Admin'],
        creatorIdentityId: identity?.id || 'id_user_1'
      })
    });
    fetchOrganizations();
  };

  if (loading && organizations.length === 0) return <div className="py-12 text-center">{lt.loading}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{lt.title}</h1>
            <p className="text-sm text-slate-500">{lt.desc}</p>
          </div>
        </div>
        <button onClick={handleCreateOrganization} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          {lt.createBtn}
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
          <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">{lt.noOrgs}</h3>
          <p className="text-sm text-slate-500 mb-4">{lt.noOrgsDesc}</p>
          <button onClick={handleCreateOrganization} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
            {lt.createBtn}
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organizations.map(org => (
          <div key={org.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm border border-slate-200">
                  <Box className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                  {org.visibility}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{org.name}</h2>
              <p className="text-sm text-slate-500 mb-6">{org.handle}</p>
              
              <div className="flex items-center gap-6 mb-2">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{(org.followers as any).human || 0}</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1 justify-center">
                    <Users className="w-3 h-3" /> {lt.members}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{org.trustProfile?.identity || 0}</p>
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wider flex items-center gap-1 justify-center">
                    <Shield className="w-3 h-3" /> {lt.trust}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
               <div className="text-xs font-semibold text-slate-500">
                 {lt.role}: <span className="text-slate-900">{org.roles[0] || 'Member'}</span>
               </div>
               <Link to={`/identity/${org.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                 {lt.enterSpace} <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
