import { useState, useEffect } from 'react';
import { Account, Session, Identity } from '../types';
import { Shield, Key, Monitor, Smartphone, Globe, LogOut, CheckCircle2, User, Users, Bot, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AccountSettings() {
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

  if (loading || !account) return <div className="py-12 text-center">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-2">Manage your authentication, sessions, and identities.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Authenticated As</p>
          <p className="text-sm font-bold text-slate-800">{account.email}</p>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-max">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'security' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Shield className="w-4 h-4" /> Security
        </button>
        <button
          onClick={() => setActiveTab('identities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'identities' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Users className="w-4 h-4" /> Identities
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'sessions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Monitor className="w-4 h-4" /> Sessions
        </button>
      </div>

      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Authentication Methods</h3>
              <p className="text-sm text-slate-500">Configure how you sign in to your account.</p>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Passkeys (WebAuthn)</h4>
                    <p className="text-sm text-slate-500">Sign in securely with biometric authentication.</p>
                  </div>
                </div>
                {account.authMethods.includes('Passkey') ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="w-4 h-4" /> Enabled
                  </span>
                ) : (
                  <button className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Set Up</button>
                )}
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">OAuth (GitHub)</h4>
                    <p className="text-sm text-slate-500">Sign in using your GitHub account.</p>
                  </div>
                </div>
                {account.authMethods.includes('GitHub') ? (
                   <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                   <CheckCircle2 className="w-4 h-4" /> Enabled
                 </span>
                ) : (
                  <button className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Connect</button>
                )}
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enable 2FA</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'identities' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="flex justify-between items-center mb-4">
            <p className="text-slate-600">This account owns the following identities. Actions on the platform are performed by the active identity.</p>
            <button onClick={handleCreateIdentity} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
              <UserPlus className="w-4 h-4" /> Create Identity
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
                  <button className="flex-1 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">Switch To</button>
                  <button className="flex-1 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Manage</button>
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
                <h3 className="text-lg font-bold text-slate-900">Active Sessions</h3>
                <p className="text-sm text-slate-500">Manage devices logged into your account.</p>
              </div>
              <button onClick={handleClearOtherSessions} className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                Sign Out All Other Devices
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
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">This Device</span>
                        )}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">{session.browser}</p>
                      <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span>IP: {session.ip}</span>
                        <span>Location: {session.location}</span>
                        <span>Last active: {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</span>
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
