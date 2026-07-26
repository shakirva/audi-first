import { useState, useEffect } from 'react';
import { getClients, addClient, updateClient, importExcel, importVCF, login } from './api';
import { Users, Upload, Plus, Phone, Mail, Package, Search, Save, X, Activity, UserPlus, Filter, FileSpreadsheet, Contact, LogOut, Lock, LayoutGrid, List } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('crm_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('crm_user') || 'null'));
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  
  const [form, setForm] = useState({ name: '', phone: '', email: '', package: 'Standard', status: 'Lead', notes: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (token) fetchClients();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { data } = await login(loginForm);
      localStorage.setItem('crm_token', data.token);
      localStorage.setItem('crm_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setToken(null);
    setUser(null);
    setClients([]);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data } = await getClients();
      setClients(data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingClient) {
      await updateClient(editingClient.id, form);
    } else {
      await addClient(form);
    }
    setShowAddModal(false);
    setEditingClient(null);
    setForm({ name: '', phone: '', email: '', package: 'Standard', status: 'Lead', notes: '' });
    fetchClients();
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      if (type === 'excel') await importExcel(formData);
      else await importVCF(formData);
      alert('Import successful!');
      fetchClients();
    } catch (err) {
      alert('Failed to import file');
    }
    e.target.value = null;
  };

  const openEdit = (client) => {
    setForm(client);
    setEditingClient(client);
    setShowAddModal(true);
  };

  const allStatuses = [
    'Lead', 'Contacted', 'Follow-up', 'Interested', 'Not Answered',
    'Scheduled Meeting', 'Conducted Meeting', 'Advance Got', 'Converted', 'Completed', 'Lost'
  ];

  // Highly vibrant color scheme
  const statusConfig = {
    'Lead': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: 'bg-indigo-500' },
    'Contacted': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300', dot: 'bg-sky-500' },
    'Follow-up': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
    'Interested': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300', dot: 'bg-fuchsia-500' },
    'Not Answered': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' },
    'Scheduled Meeting': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', dot: 'bg-cyan-500' },
    'Conducted Meeting': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', dot: 'bg-teal-500' },
    'Advance Got': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300', dot: 'bg-lime-500' },
    'Converted': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
    'Completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' },
    'Lost': { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-500' }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-6 text-sm">Sign in to Venueza Sales CRM</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input type="email" required placeholder="Email address" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <input type="password" required placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center font-medium">{loginError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl font-bold hover:shadow-lg transition shadow-md active:scale-95">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-24 font-sans selection:bg-[#1B4332] selection:text-white">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-[#0F2027] via-[#203A43] to-[#2C5364] text-white sticky top-0 z-10 shadow-xl shadow-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
              <Package size={22} className="text-emerald-400 drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white/95">Venueza Sales</h1>
              <p className="text-[10px] text-emerald-400/90 font-bold uppercase tracking-widest">{user?.role} • {user?.name}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <label className="group relative flex items-center justify-center bg-white/10 hover:bg-white/20 p-2.5 rounded-xl cursor-pointer transition-all border border-white/10 hover:border-white/30 shadow-inner" title="Import Excel">
              <FileSpreadsheet size={18} className="text-emerald-300 group-hover:text-emerald-200" />
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFileUpload(e, 'excel')} />
            </label>
            <label className="group relative flex items-center justify-center bg-white/10 hover:bg-white/20 p-2.5 rounded-xl cursor-pointer transition-all border border-white/10 hover:border-white/30 shadow-inner" title="Import VCF Contacts">
              <Contact size={18} className="text-blue-300 group-hover:text-blue-200" />
              <input type="file" accept=".vcf" className="hidden" onChange={(e) => handleFileUpload(e, 'vcf')} />
            </label>
            <button onClick={handleLogout} className="group relative flex items-center justify-center bg-white/10 hover:bg-rose-500/40 p-2.5 rounded-xl cursor-pointer transition-all border border-white/10 hover:border-rose-500/50 ml-2 shadow-inner" title="Logout">
              <LogOut size={18} className="text-slate-300 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-emerald-300/80" />
              </div>
              <input 
                type="text" 
                placeholder="Search clients by name or phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border-0 rounded-2xl leading-5 bg-white/10 text-white placeholder-slate-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 sm:text-sm backdrop-blur-md transition-all shadow-inner"
              />
            </div>
            
            <div className="flex bg-white/10 p-1 rounded-2xl backdrop-blur-md border border-white/10 w-fit">
              <button onClick={() => setViewMode('cards')} className={`p-2 rounded-xl flex items-center gap-1 transition-all ${viewMode === 'cards' ? 'bg-white/20 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                <LayoutGrid size={18} /> <span className="text-sm font-medium pr-1 hidden sm:block">Cards</span>
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl flex items-center gap-1 transition-all ${viewMode === 'table' ? 'bg-white/20 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                <List size={18} /> <span className="text-sm font-medium pr-1 hidden sm:block">Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips - Colorful & Scrollable */}
      <div className="bg-white border-b border-slate-200 sticky top-[138px] z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-2 text-slate-400 pr-2 border-r border-slate-200">
            <Filter size={16} /> <span className="text-xs font-bold uppercase">Filters</span>
          </div>
          <button 
            onClick={() => setStatusFilter('All')} 
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${statusFilter === 'All' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            All Leads
          </button>
          
          {allStatuses.map(status => {
            const conf = statusConfig[status];
            const isActive = statusFilter === status;
            return (
              <button 
                key={status} 
                onClick={() => setStatusFilter(status)} 
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2
                  ${isActive ? conf.bg + ' ' + conf.text + ' ' + conf.border + ' shadow-sm ring-2 ring-offset-1 ' + conf.border.replace('border-', 'ring-') : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <div className={`w-2 h-2 rounded-full ${conf.dot}`}></div>
                {status}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={20} className="text-emerald-600" /> Client Roster
          </h2>
          <div className="flex items-center gap-1 text-sm bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600 font-bold shadow-sm">
            {filteredClients.length} {statusFilter !== 'All' ? statusFilter : 'Total'}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4 shadow-lg"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-200 shadow-inner">
              <Users size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No clients found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Try changing your filters or add a new client to build your sales pipeline.</p>
          </div>
        ) : (
          <>
            {/* CARDS VIEW */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredClients.map(client => {
                  const conf = statusConfig[client.status] || statusConfig['Lead'];
                  return (
                    <div key={client.id} onClick={() => openEdit(client)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-lg cursor-pointer transition-all group active:scale-[0.98] relative overflow-hidden">
                      {/* Top colored accent bar */}
                      <div className={`absolute top-0 left-0 w-full h-1.5 ${conf.dot}`}></div>
                      
                      <div className="flex justify-between items-start mb-3 pt-1">
                        <div className="flex-1 pr-2">
                          <h3 className="font-extrabold text-slate-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors line-clamp-1">{client.name}</h3>
                          {user?.role === 'Owner' && client.User && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                              <Users size={10} /> {client.User.name}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${conf.bg} ${conf.text} ${conf.border} whitespace-nowrap shadow-sm`}>
                          {client.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                        {client.package === 'Advanced' ? (
                          <span className="text-[10px] font-bold uppercase bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-2.5 py-1 rounded-md border border-amber-300 shadow-sm">⭐ Advanced</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">Standard</span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                            <div className="bg-white p-1 rounded-md shadow-sm text-emerald-600 border border-slate-100"><Phone size={14} /></div>
                            <span className="font-semibold">{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                            <div className="bg-white p-1 rounded-md shadow-sm text-emerald-600 border border-slate-100"><Mail size={14} /></div>
                            <span className="truncate font-medium">{client.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABLE VIEW */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Client Info</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Package</th>
                        <th className="px-6 py-4">Status</th>
                        {user?.role === 'Owner' && <th className="px-6 py-4">Agent</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClients.map(client => {
                        const conf = statusConfig[client.status] || statusConfig['Lead'];
                        return (
                          <tr key={client.id} onClick={() => openEdit(client)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-extrabold text-slate-800 text-base group-hover:text-emerald-700">{client.name}</p>
                              {client.notes && <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-[200px]">{client.notes}</p>}
                            </td>
                            <td className="px-6 py-4">
                              {client.phone && <div className="flex items-center gap-1 text-slate-600 font-medium mb-1"><Phone size={12} className="text-slate-400"/> {client.phone}</div>}
                              {client.email && <div className="flex items-center gap-1 text-slate-500 text-xs"><Mail size={12} className="text-slate-400"/> {client.email}</div>}
                            </td>
                            <td className="px-6 py-4">
                              {client.package === 'Advanced' 
                                ? <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200">⭐ Advanced</span>
                                : <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">Standard</span>
                              }
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[11px] px-3 py-1.5 rounded-full font-bold border ${conf.bg} ${conf.text} ${conf.border} shadow-sm inline-flex items-center gap-1.5`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${conf.dot}`}></div>
                                {client.status}
                              </span>
                            </td>
                            {user?.role === 'Owner' && (
                              <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                                {client.User?.name || '-'}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => { setEditingClient(null); setForm({ name: '', phone: '', email: '', package: 'Standard', status: 'Lead', notes: '' }); setShowAddModal(true); }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all hover:-translate-y-1 active:scale-95 z-20 flex items-center justify-center border border-emerald-400/50"
      >
        <Plus size={28} className="drop-shadow-md" />
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>
          
          <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">{editingClient ? 'Update Client' : 'New Lead'}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="bg-white hover:bg-slate-200 text-slate-500 p-2 rounded-full transition-colors shadow-sm border border-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Client Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500"><Users size={18} /></div>
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-sm" placeholder="Acme Corp" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500"><Phone size={18} /></div>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-sm" placeholder="+91 98765..." />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500"><Mail size={18} /></div>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-sm" placeholder="email@domain.com" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Lead Status</label>
                <div className="relative">
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none appearance-none transition-all shadow-sm">
                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <div className={`w-3 h-3 rounded-full ${statusConfig[form.status]?.dot}`}></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Subscription Package</label>
                <div className="flex gap-3">
                  <label className={`flex-1 cursor-pointer p-4 border rounded-xl text-center font-extrabold transition-all shadow-sm ${form.package === 'Standard' ? 'border-slate-800 bg-slate-800 text-white shadow-slate-400/30' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-300'}`}>
                    <input type="radio" name="package" value="Standard" className="hidden" onChange={e => setForm({...form, package: e.target.value})} checked={form.package === 'Standard'} />
                    Standard
                  </label>
                  <label className={`flex-1 cursor-pointer p-4 border rounded-xl text-center font-extrabold transition-all shadow-sm ${form.package === 'Advanced' ? 'border-amber-500 bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-300'}`}>
                    <input type="radio" name="package" value="Advanced" className="hidden" onChange={e => setForm({...form, package: e.target.value})} checked={form.package === 'Advanced'} />
                    ⭐ Advanced
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Notes</label>
                <textarea rows="3" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} className="block w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none resize-none transition-all shadow-sm" placeholder="Meeting details, requirements..."></textarea>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95">
                  <Save size={20} /> {editingClient ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
