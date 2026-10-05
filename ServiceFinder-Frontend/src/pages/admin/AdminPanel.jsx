import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';

function AdminPanel() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState(urlTab || 'overview');

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, admins: 0, providers: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const [svcForm, setSvcForm] = useState({ name: '', icon: '', color: '' });
  const [svcEditId, setSvcEditId] = useState(null);
  const [svcError, setSvcError] = useState('');
  const [svcSaving, setSvcSaving] = useState(false);

  useEffect(() => {
    if (urlTab) setTab(urlTab);
    else setTab('overview');
  }, [urlTab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, rRes, pRes, svcRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/requests'),
        api.get('/providers'),
        api.get('/services'),
      ]);
      setUsers(uRes.data || []);
      setStats(sRes.data || {});
      setRequests(rRes.data || []);
      setProviders(pRes.data || []);
      setServices(svcRes.data || []);

      if (uRes.data && pRes.data) {
        const totalCustomers = uRes.data.filter((u) => u.role === 'CUSTOMER').length;
        const totalProviders = (pRes.data || []).length;
        if (urlTab === 'customers') {
          localStorage.setItem('adminSeenCustomers', totalCustomers.toString());
        }
        if (location.pathname === '/providers') {
          localStorage.setItem('adminSeenProviders', totalProviders.toString());
        }
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [urlTab, location.pathname]);

  // NEWEST FIRST — sort by ID descending
  const customers = users
    .filter((u) => u.role === 'CUSTOMER')
    .sort((a, b) => (b.id || 0) - (a.id || 0));

  const providerUsers = users
    .filter((u) => u.role === 'PROVIDER')
    .sort((a, b) => (b.id || 0) - (a.id || 0));

  const getCustomerRequests = (customerId) =>
    requests
      .filter((r) => r.user?.id === customerId)
      .sort((a, b) => (b.id || 0) - (a.id || 0));

  const getCounts = (list) => ({
    total: list.length,
    pending: list.filter((r) => (r.status || '').toUpperCase() === 'PENDING').length,
    accepted: list.filter((r) => (r.status || '').toUpperCase() === 'ACCEPTED').length,
    rejected: list.filter((r) => (r.status || '').toUpperCase() === 'REJECTED').length,
  });

  const formatTime = (t) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr12 = hour % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? Saari requests bhi delete hongi.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadAll();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setSvcError(''); setSvcSaving(true);
    try {
      if (svcEditId) {
        await api.put(`/services/${svcEditId}`, svcForm);
      } else {
        await api.post('/services', svcForm);
      }
      setSvcForm({ name: '', icon: '', color: '' });
      setSvcEditId(null);
      loadAll();
    } catch (err) {
      setSvcError(err.response?.data?.error || 'Failed');
    } finally {
      setSvcSaving(false);
    }
  };

  const handleServiceEdit = (s) => {
    setSvcEditId(s.id);
    setSvcForm({ name: s.name, icon: s.icon, color: s.color });
  };

  const handleServiceDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      loadAll();
    } catch (err) { alert('Delete failed'); }
  };

  const cancelServiceEdit = () => {
    setSvcEditId(null);
    setSvcForm({ name: '', icon: '', color: '' });
    setSvcError('');
  };

  const StatCard = ({ label, value, color }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 ${color}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
    </div>
  );

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  const isServicesOnlyView = urlTab === 'services';
  const isCustomersOnlyView = urlTab === 'customers';
  const isStandaloneView = isServicesOnlyView || isCustomersOnlyView;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-6">
          {isServicesOnlyView && '🛠️ Manage Services'}
          {isCustomersOnlyView && '👤 Manage Customers'}
          {!isStandaloneView && '👑 Admin Panel'}
        </h1>

        {!isStandaloneView && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Users" value={stats.totalUsers || 0} color="border-blue-500" />
            <StatCard label="Customers" value={stats.customers || 0} color="border-primary-500" />
            <StatCard label="Providers" value={stats.providers || 0} color="border-green-500" />
            <StatCard label="Services" value={services.length} color="border-yellow-500" />
          </div>
        )}

        {!isStandaloneView && (
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'overview', label: '📊 Overview' },
              { key: 'customers', label: `👤 Customers (${customers.length})` },
              { key: 'providers', label: `🔧 Providers (${providerUsers.length})` },
              { key: 'services', label: `🛠️ Services (${services.length})` },
            ].map((t) => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  tab === t.key ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {tab === 'overview' && !isStandaloneView && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Role Distribution</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">👤 Customers: <span className="font-bold">{stats.customers || 0}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">🔧 Providers: <span className="font-bold">{stats.providers || 0}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">👑 Admins: <span className="font-bold">{stats.admins || 0}</span></p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Request Status</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">⏳ Pending: <span className="font-bold">{requests.filter((r) => (r.status || '').toUpperCase() === 'PENDING').length}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">✅ Accepted: <span className="font-bold">{requests.filter((r) => (r.status || '').toUpperCase() === 'ACCEPTED').length}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">❌ Rejected: <span className="font-bold">{requests.filter((r) => (r.status || '').toUpperCase() === 'REJECTED').length}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* ====== CUSTOMERS — NEWEST FIRST + DETAILS ====== */}
        {tab === 'customers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {customers.map((c) => {
              const myReqs = getCustomerRequests(c.id);
              const counts = getCounts(myReqs);
              const isOpen = expandedCustomer === c.id;
              const isNewest = c.id === customers[0]?.id;

              return (
                <div
                  key={c.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-2 transition-all ${
                    isNewest
                      ? 'border-green-400 ring-2 ring-green-200 dark:ring-green-900'
                      : 'border-gray-200 dark:border-gray-700'
                  } ${isOpen ? 'md:col-span-2 lg:col-span-3' : ''}`}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white relative">
                    {isNewest && (
                      <span className="absolute top-2 right-2 bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        🆕 NEW
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                        {c.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">{c.name}</h3>
                        <p className="text-xs opacity-90">ID: #{c.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p className="truncate">📧 {c.email || '-'}</p>
                    <p>📞 {c.phone || '-'}</p>
                  </div>

                  <div className="px-4 pb-3 flex flex-wrap gap-1">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                      Total: {counts.total}
                    </span>
                    <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
                      ⏳ {counts.pending}
                    </span>
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                      ✅ {counts.accepted}
                    </span>
                    <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-xs font-semibold">
                      ❌ {counts.rejected}
                    </span>
                  </div>

                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExpandedCustomer(isOpen ? null : c.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm transition"
                    >
                      {isOpen ? '▲ Hide Details' : '▼ Details'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(c.id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold text-sm transition"
                    >
                      Delete
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t-2 border-blue-500 bg-gray-50 dark:bg-gray-900/50 p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
                            📋 Contact Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">Full Name:</span> <strong>{c.name || '-'}</strong></p>
                            <p><span className="text-gray-500">Email:</span> {c.email || '-'}</p>
                            <p><span className="text-gray-500">Phone:</span> <strong>{c.phone || '-'}</strong></p>
                            <p><span className="text-gray-500">Role:</span> <span className="text-blue-600 font-semibold">{c.role}</span></p>
                            <p><span className="text-gray-500">User ID:</span> #{c.id}</p>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
                            📊 Request Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-blue-600">{counts.total}</p>
                              <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
                              <p className="text-xs text-gray-500">Pending</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-green-600">{counts.accepted}</p>
                              <p className="text-xs text-gray-500">Accepted</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
                              <p className="text-xs text-gray-500">Rejected</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
                          📩 All Requests ({myReqs.length})
                        </h4>
                        {myReqs.length === 0 ? (
                          <p className="text-center text-gray-500 text-sm py-6 bg-white dark:bg-gray-800 rounded-lg">
                            Is customer ne koi request nahi bheji
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {myReqs.map((r) => {
                              const st = (r.status || '').toUpperCase();
                              const color =
                                st === 'ACCEPTED'
                                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                                  : st === 'PENDING'
                                  ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                                  : 'text-red-600 bg-red-50 dark:bg-red-900/20';
                              return (
                                <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                                      Request #{r.id} → {r.provider?.name || '-'}
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>
                                      {st}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <p>🔧 <strong>Service:</strong> {r.provider?.service || '-'}</p>
                                    <p>📅 <strong>Date:</strong> {r.preferredDate || '-'}</p>
                                    <p>🕐 <strong>Time:</strong> {formatTime(r.preferredTime)}</p>
                                    <p>📍 <strong>Location:</strong> {r.location || '-'}</p>
                                    <p>🏠 <strong>Type:</strong> {r.locationType || '-'}</p>
                                    {r.locationNote && (
                                      <p className="md:col-span-2">📝 <strong>Note:</strong> {r.locationNote}</p>
                                    )}
                                  </div>
                                  {r.message && (
                                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                      "{r.message}"
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {customers.length === 0 && (
              <p className="col-span-full text-center py-8 text-gray-500">No customers</p>
            )}
          </div>
        )}

        {tab === 'providers' && !isStandaloneView && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {providerUsers.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{u.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.phone}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteUser(u.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                {svcEditId ? '✏️ Edit Service' : '➕ Add New Service'}
              </h2>

              {svcError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg mb-3 text-sm">
                  {svcError}
                </div>
              )}

              <form onSubmit={handleServiceSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name *</label>
                  <input type="text" required value={svcForm.name}
                    onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })}
                    placeholder="e.g. Electrician"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
                  <input type="text" value={svcForm.icon}
                    onChange={(e) => setSvcForm({ ...svcForm, icon: e.target.value })}
                    placeholder="⚡ 🔧 ❄️" maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                  <select value={svcForm.color}
                    onChange={(e) => setSvcForm({ ...svcForm, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">-- Select color --</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-cyan-500">Cyan</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-pink-500">Pink</option>
                    <option value="bg-orange-500">Orange</option>
                    <option value="bg-indigo-500">Indigo</option>
                    <option value="bg-teal-500">Teal</option>
                    <option value="bg-red-500">Red</option>
                    <option value="bg-rose-500">Rose</option>
                    <option value="bg-gray-500">Gray</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={svcSaving}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition">
                    {svcSaving ? 'Saving...' : (svcEditId ? 'Update' : 'Add')}
                  </button>
                  {svcEditId && (
                    <button type="button" onClick={cancelServiceEdit}
                      className="px-4 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-800 dark:text-gray-100 rounded-lg font-semibold transition">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">All Services ({services.length})</h2>
              {services.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No services yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`${s.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}>{s.icon}</div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{s.name}</p>
                          <p className="text-xs text-gray-500">ID: {s.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleServiceEdit(s)}
                          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs font-semibold">Edit</button>
                        <button onClick={() => handleServiceDelete(s.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold">Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
