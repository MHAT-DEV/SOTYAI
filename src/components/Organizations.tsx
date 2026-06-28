import { useState, useEffect } from 'react';
import { Box, Shield, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Identity } from '../types';

interface OrganizationsProps {
  identity?: Identity | null;
}

export default function Organizations({ identity }: OrganizationsProps) {
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
    const name = window.prompt("Enter new organization name:");
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

  if (loading && organizations.length === 0) return <div className="py-12 text-center">Loading organizations...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Spaces</h1>
            <p className="text-sm text-slate-500">Collaborative environments for your teams and verified organizations.</p>
          </div>
        </div>
        <button onClick={handleCreateOrganization} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Create Organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
          <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Organizations Found</h3>
          <p className="text-sm text-slate-500 mb-4">Create your first organization space to collaborate with your team.</p>
          <button onClick={handleCreateOrganization} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
            Create Organization
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
                    <Users className="w-3 h-3" /> Members
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{org.trustProfile?.identity || 0}</p>
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wider flex items-center gap-1 justify-center">
                    <Shield className="w-3 h-3" /> Trust
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
               <div className="text-xs font-semibold text-slate-500">
                 Role: <span className="text-slate-900">{org.roles[0] || 'Member'}</span>
               </div>
               <Link to={`/identity/${org.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                 Enter Space <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
