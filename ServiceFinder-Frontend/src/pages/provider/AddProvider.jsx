import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProvider, getServices } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FALLBACK_SERVICES = [
  { name: 'Electrician' }, { name: 'Plumber' }, { name: 'AC Technician' },
  { name: 'Computer Repair' }, { name: 'Tutor' }, { name: 'Painter' },
];

function AddProvider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [form, setForm] = useState({
    name: user?.name || '',
    service: '',
    location: '',
    experience: '',
    rate: '',
    phone: user?.phone || '',
    description: '',
    availableDays: '',
    availableTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getServices();
        if (res.data && res.data.length > 0) setServices(res.data);
      } catch (err) {
        console.error('Services load failed:', err);
      }
    };
    load();
  }, []);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service) { setError('Please select a service'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      await createProvider({ ...form, userId: user.id, rating: 0.0 });
      setSuccess('Provider profile created!');
      setTimeout(() => navigate('/providers'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add provider');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Register as Provider
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Your Name</label>
            <input type="text" value={form.name} disabled
              className={`${inputClass} opacity-60`} />
          </div>

          <div>
            <label className={labelClass}>Service Type *</label>
            <select required value={form.service}
              onChange={(e) => update('service', e.target.value)}
              className={inputClass}>
              <option value="">-- Select service --</option>
              {services.map((s, idx) => (
                <option key={s.id || idx} value={s.name}>
                  {s.icon ? `${s.icon} ` : ''}{s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Location *</label>
            <input type="text" required value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className={inputClass} placeholder="e.g. Rawalpindi" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Experience (years)</label>
              <input type="number" value={form.experience} min="0"
                onChange={(e) => update('experience', e.target.value)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Rate (PKR)</label>
              <input type="number" value={form.rate} min="0"
                onChange={(e) => update('rate', e.target.value)}
                className={inputClass} placeholder="1500" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows="3" className={inputClass}
              placeholder="Apne kaam ke baare mein likho..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Available Days</label>
              <input type="text" value={form.availableDays}
                onChange={(e) => update('availableDays', e.target.value)}
                className={inputClass} placeholder="Mon-Sat" />
            </div>
            <div>
              <label className={labelClass}>Available Time</label>
              <input type="text" value={form.availableTime}
                onChange={(e) => update('availableTime', e.target.value)}
                className={inputClass} placeholder="9 AM - 6 PM" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition">
            {loading ? 'Adding...' : 'Add Provider'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProvider;
