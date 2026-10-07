import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRequestsByUser } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getRequestsByUser(user.id);
      // ✅ PENDING wale upar, phir newest first
      const sorted = (res.data || []).sort((a, b) => {
        const aPending = (a.status || '').toUpperCase() === 'PENDING' ? 1 : 0;
        const bPending = (b.status || '').toUpperCase() === 'PENDING' ? 1 : 0;
        if (aPending !== bPending) return bPending - aPending;
        return (b.id || 0) - (a.id || 0);
      });
      setRequests(sorted);
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatTime = (t) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr12 = hour % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
  };

  // ============================================
  // EXACT DATE & TIME (Kab request bheji)
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

  if (loading) {
    return (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          Loading...
        </div>
    );
  }

  return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          My Service Requests
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Sirf aapki bheji hui requests ({requests.length})
        </p>

        {requests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No requests yet
              </p>
              <Link
                  to="/providers"
                  className="text-primary-600 dark:text-primary-500 hover:underline"
              >
                Browse providers →
              </Link>
            </div>
        ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                  <div
                      key={r.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Request #{r.id}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          To: {r.provider?.name || "N/A"} — {r.provider?.service}
                        </p>
                        {/* ✅ Request send karne ka time */}
                        {r.createdAt && (
                            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                              🕒 Request bheji: {fullTimestamp(r.createdAt)}
                            </p>
                        )}
                      </div>
                      <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(r.status)}`}
                      >
                  {(r.status || '').toUpperCase()}
                </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        👤 <strong>Customer:</strong> {r.user?.name || '-'}
                      </p>
                      <p>
                        📞 <strong>Phone:</strong> {r.user?.phone || '-'}
                      </p>
                      {r.location && (
                          <p>
                            📍 <strong>Your Location:</strong> {r.location}
                          </p>
                      )}
                      <p>
                        📍 <strong>Provider Location:</strong> {r.provider?.location || '-'}
                      </p>
                      {r.preferredDate && (
                          <p>
                            📅 <strong>Preferred Date:</strong> {r.preferredDate}
                          </p>
                      )}
                      {r.preferredTime && (
                          <p>
                            🕐 <strong>Preferred Time:</strong> {formatTime(r.preferredTime)}
                          </p>
                      )}
                    </div>

                    {r.message && (
                        <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {r.message}
                          </p>
                        </div>
                    )}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}

export default MyRequests;