import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProviderById } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import RequestForm from "../../components/providers/RequestForm";

function ProviderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProvider();
  }, [id]);

  const fetchProvider = async () => {
    try {
      const res = await getProviderById(id);
      setProvider(res.data);
    } catch (err) {
      console.error(err);
      setError("Provider not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => navigate("/my-requests"), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-xl mb-4">{error || "Provider not found"}</p>
        <Link to="/providers" className="text-primary-600 dark:text-primary-500 hover:underline">
          ← Back to providers
        </Link>
      </div>
    );
  }

  const isOwnCard =
    user && user.role === 'PROVIDER' && provider.userId === user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/providers"
        className="text-primary-600 dark:text-primary-500 hover:underline mb-6 inline-block"
      >
        ← Back to providers
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 md:p-8">
          {isOwnCard && (
            <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-2">
              ★ Your Card
            </span>
          )}
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{provider.name}</h1>
          <p className="text-lg md:text-xl opacity-90">{provider.service}</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Detail Grid — 6 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                📍 {provider.location || '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Experience</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                💼 {provider.experience || 0} years
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Phone</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                📞 {provider.phone || '-'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Rating</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ⭐ {provider.rating ? `${provider.rating}/5` : 'New Provider'}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Rate</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                💰 {provider.rate ? `${provider.rate} PKR` : 'Negotiable'}
              </p>
              {provider.rate && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  per visit
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Availability</p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                📅 {provider.availableDays || 'Not specified'}
              </p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                🕐 {provider.availableTime || 'Not specified'}
              </p>
            </div>
          </div>

          {/* About */}
          {provider.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                About
              </h3>
              <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                {provider.description}
              </p>
            </div>
          )}

          {/* Own card message */}
          {isOwnCard && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 p-4 rounded-lg text-center text-sm">
              Ye aapka apna card hai — Request bhejne ke liye doosre providers ki profile kholo.
            </div>
          )}

          {/* Request button */}
          {!isOwnCard && !showForm && !success && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold text-lg transition"
            >
              📩 Request Service
            </button>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-6 rounded-lg text-center">
              <p className="text-xl font-semibold">✅ Request Submitted!</p>
              <p className="mt-2">Redirecting...</p>
            </div>
          )}

          {showForm && !success && (
            <RequestForm
              providerId={id}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderDetails;
