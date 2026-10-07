import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [seenIds, setSeenIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`seenRequests_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const provRes = await api.get('/providers');
      // ✅ FILTER — user ke SAARE providers lo (sirf pehla nahi)
      const myProviders = (provRes.data || []).filter(
          (p) => p.userId === user.id
      );

      if (myProviders.length === 0) {
        setRequests([]);
        return;
      }

      // ✅ Har provider ke requests alag alag lao aur combine karo
      const allRequests = [];
      for (const mp of myProviders) {
        try {
          const reqRes = await api.get(`/requests/provider/${mp.id}`);
          allRequests.push(...(reqRes.data || []));
        } catch (err) {
          console.error(`Failed to load requests for provider ${mp.id}`, err);
        }
      }

      const sorted = allRequests.sort((a, b) => {
        const aPending = (a.status || '').toUpperCase() === 'PENDING' ? 1 : 0;
        const bPending = (b.status || '').toUpperCase() === 'PENDING' ? 1 : 0;
        if (aPending !== bPending) return bPending - aPending;
        return (b.id || 0) - (a.id || 0);
      });
      setRequests(sorted);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ============================================
  // Auto-mark requests as seen after 3 seconds
  // ============================================
  useEffect(() => {
    if (requests.length === 0) return;

    const timer = setTimeout(() => {
      const currentIds = requests.map((r) => r.id);
      const merged = Array.from(new Set([...seenIds, ...currentIds]));

      localStorage.setItem(`seenRequests_${user.id}`, JSON.stringify(merged));
      setSeenIds(merged);
    }, 3000);

    return () => clearTimeout(timer);
  }, [requests]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      loadRequests();
    } catch (err) {
      alert('Update failed');
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await api.delete(`/requests/${id}`);
      loadRequests();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === 'ALL') return true;
    return (r.status || '').toUpperCase() === filter;
  });

  const total = requests.length;
  const pending = requests.filter((r) => (r.status || '').toUpperCase() === 'PENDING').length;
  const accepted = requests.filter((r) => (r.status || '').toUpperCase() === 'ACCEPTED').length;
  const rejected = requests.filter((r) => (r.status || '').toUpperCase() === 'REJECTED').length;

  const StatCard = ({ label, value, color }) => (
      <div className={`rounded-xl p-4 border-2 ${color} bg-white dark:bg-gray-800`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
      </div>
  );

  const formatTime = (t) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr12 = hour % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
  };

  // ============================================
  // EXACT DATE & TIME (FIXED - No timezone offset)
  // ============================================
  const fullTimestamp = (ts) => {
    if (!ts) return '-';
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (err) {
      return '-';
    }
  };

  const LOCATION_TYPE_LABELS = {
    HOME: '🏠 Home',
    SHOP: '🏪 Shop',
    OFFICE: '🏢 Office',
    OTHER: '📍 Other',
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500 mb-6">
            Provider Dashboard
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total" value={total} color="border-gray-300 dark:border-gray-700" />
            <StatCard label="Pending" value={pending} color="border-yellow-500" />
            <StatCard label="Accepted" value={accepted} color="border-green-500" />
            <StatCard label="Rejected" value={rejected} color="border-red-500" />
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                        filter === f
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {f}
                </button>
            ))}
          </div>

          {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}

          {!loading && filtered.length === 0 && (
              <p className="text-center text-gray-500 py-10">No requests found</p>
          )}

          <div className="space-y-4">
            {filtered.map((r) => {
              const st = (r.status || '').toUpperCase();
              const statusColor =
                  st === 'ACCEPTED'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : st === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

              const isNew = st === 'PENDING' && !seenIds.includes(r.id);

              return (
                  <div
                      key={r.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-2 transition-all ${
                          isNew
                              ? 'border-green-400 ring-2 ring-green-200 dark:ring-green-900'
                              : 'border-transparent'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          Request #{r.id}
                          {isNew && (
                              <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                          🆕 NEW
                        </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Provider: {r.provider?.name || '-'} — {r.provider?.service || '-'}
                        </p>
                        {r.createdAt && (
                            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">
                              🕒 Request aya: {fullTimestamp(r.createdAt)}
                            </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                    {st}
                  </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <p>Customer: <strong>{r.user?.name || '-'}</strong></p>
                      <p>Email: {r.user?.email || '-'}</p>
                      <p>Phone: {r.user?.phone || '-'}</p>
                      <p>📅 Date: {r.preferredDate || '-'}</p>
                      <p>🕐 Time: <strong>{formatTime(r.preferredTime)}</strong></p>
                      {r.locationType && (
                          <p>🏠 Type: <strong>{LOCATION_TYPE_LABELS[r.locationType] || r.locationType}</strong></p>
                      )}
                      {r.location && (
                          <p className="md:col-span-2">
                            📍 <strong>Customer Location:</strong>{' '}
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                        {r.location}
                      </span>
                          </p>
                      )}
                      {r.locationNote && (
                          <p className="md:col-span-2">
                            📝 <strong>Note:</strong> {r.locationNote}
                          </p>
                      )}
                    </div>

                    {r.message && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                          {r.message}
                        </p>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {st === 'PENDING' ? (
                          <>
                            <button
                                onClick={() => updateStatus(r.id, 'ACCEPTED')}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition"
                            >
                              Accept
                            </button>
                            <button
                                onClick={() => updateStatus(r.id, 'REJECTED')}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                            >
                              Reject
                            </button>
                          </>
                      ) : (
                          <button
                              onClick={() => updateStatus(r.id, 'PENDING')}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition"
                          >
                            Mark Pending
                          </button>
                      )}
                      <button
                          onClick={() => deleteRequest(r.id)}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
              );
            })}
          </div>
        </div>
      </div>
  );
}

export default Dashboard;