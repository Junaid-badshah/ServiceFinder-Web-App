import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/auth/PasswordInput';
import { getServices } from '../../services/api';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Gujranwala',
];

const FALLBACK_SERVICES = [
  { name: 'Electrician' }, { name: 'Plumber' }, { name: 'AC Technician' },
  { name: 'Computer Repair' }, { name: 'Tutor' }, { name: 'Painter' },
];

function RegisterProvider() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    service: '', location: '', description: '',
    experience: '', rate: '', availableDays: '', availableTime: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const sendOtp = async () => {
    if (!form.phone) { setError('Please enter phone number'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      setDemoOtp(data.demoOtp || '');
      setSuccess('OTP sent! Check the yellow hint below.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) { setError('Please enter OTP'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setVerified(true);
      setSuccess('Phone verified!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!verified) { setError('Please verify phone first'); return; }
    if (!form.service) { setError('Please select a service'); return; }
    if (!form.location) { setError('Please select a location'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/api/auth/register-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Registration failed');
      const user = await res.json();
      login(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-900 px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-500">
            🔧 Register as Provider
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Show your services to customers
          </p>
        </div>

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

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" required value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputClass} placeholder="Ali Khan" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" required value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass} placeholder="you@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password *</label>
              <PasswordInput value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Create a password" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <div className="flex gap-3">
                <input type="tel" required value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  disabled={otpSent}
                  className={`${inputClass} flex-1 disabled:opacity-60`}
                  placeholder="0300-1234567" />
                <button type="button" onClick={sendOtp}
                  disabled={loading || otpSent || verified}
                  className="whitespace-nowrap px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition">
                  {otpSent ? 'Sent ✓' : 'Send OTP'}
                </button>
              </div>
            </div>
          </div>

          {otpSent && !verified && (
            <div>
              <label className={labelClass}>Enter OTP *</label>
              <div className="flex gap-3">
                <input type="text" value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${inputClass} flex-1`}
                  placeholder="6-digit code" maxLength={6} />
                <button type="button" onClick={verifyOtp} disabled={loading}
                  className="whitespace-nowrap px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition">
                  Verify
                </button>
              </div>
              {demoOtp && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  💡 Dev Mode — OTP: <strong className="font-mono">{demoOtp}</strong>
                </p>
              )}
            </div>
          )}

          {verified && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm">
              ✅ Phone verified — ab form complete karo
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Service *</label>
              <select required value={form.service}
                onChange={(e) => update('service', e.target.value)}
                className={inputClass}>
                <option value="">-- Select your service --</option>
                {services.map((s, idx) => (
                  <option key={s.id || idx} value={s.name}>
                    {s.icon ? `${s.icon} ` : ''}{s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Location *</label>
              <select required value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className={inputClass}>
                <option value="">-- Select your city --</option>
                {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Experience (years)</label>
              <input type="number" value={form.experience}
                onChange={(e) => update('experience', e.target.value)}
                className={inputClass} placeholder="5" min="0" />
            </div>
            <div>
              <label className={labelClass}>Rate (PKR per visit)</label>
              <input type="number" value={form.rate}
                onChange={(e) => update('rate', e.target.value)}
                className={inputClass} placeholder="1500" min="0" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows="3" className={inputClass}
              placeholder="Apne kaam ke baare mein likho..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <button type="submit" disabled={loading || !verified}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
            {loading ? 'Creating account...' : 'Register as Provider'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>

        <button onClick={() => navigate('/login')}
          className="w-full mt-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2.5 rounded-lg font-semibold text-sm transition">
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default RegisterProvider;
