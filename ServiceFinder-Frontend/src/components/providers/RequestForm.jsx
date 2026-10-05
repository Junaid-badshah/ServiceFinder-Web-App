import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LocationInput from "../search/LocationInput";

const LOCATION_TYPES = [
  { value: 'HOME', icon: '🏠', label: 'Home' },
  { value: 'SHOP', icon: '🏪', label: 'Shop' },
  { value: 'OFFICE', icon: '🏢', label: 'Office' },
  { value: 'OTHER', icon: '📍', label: 'Other' },
];

function RequestForm({ providerId, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    message: "",
    preferredDate: "",
    preferredTime: "",
    location: "",
    locationType: "HOME",
    locationNote: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // VALIDATION — Submit se pehle check
  // ============================================
  const validateForm = () => {
    // 1. Location required
    if (!form.location || !form.location.trim()) {
      return "Please select your location on the map";
    }

    // 2. Message required (min 5 chars)
    if (!form.message || form.message.trim().length < 5) {
      return "Please describe your problem (at least 5 characters)";
    }

    // 3. Date required
    if (!form.preferredDate) {
      return "Please select preferred date";
    }

    // 4. Time required
    if (!form.preferredTime) {
      return "Please select preferred time";
    }

    // 5. Date + Time must be in future
    const dateTimeStr = `${form.preferredDate}T${form.preferredTime}`;
    const selectedDateTime = new Date(dateTimeStr);
    const now = new Date();

    if (isNaN(selectedDateTime.getTime())) {
      return "Invalid date or time";
    }

    if (selectedDateTime < now) {
      return "Date aur time future mein hona chahiye (past nahi)";
    }

    // 6. Max 30 days in future
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (selectedDateTime > maxDate) {
      return "Date 30 din se zyada door nahi ho sakti";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        user: { id: user.id },
        provider: { id: parseInt(providerId) },
        message: form.message.trim(),
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        location: form.location,
        locationType: form.locationType,
        locationNote: form.locationNote?.trim() || null,
        status: "PENDING",
      };
      await api.post("/requests", payload);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500";

  // Today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg space-y-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request Service</h3>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-1">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Your Contact Info</p>
        <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Name:</strong> {user.name}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200"><strong>Phone:</strong> {user.phone}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Kahan service chahiye? *
        </label>
        <div className="grid grid-cols-4 gap-2">
          {LOCATION_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => setForm({ ...form, locationType: t.value })}
              className={`p-3 rounded-xl border-2 transition text-center ${form.locationType === t.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'}`}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Location *
        </label>
        <div className="rounded-xl overflow-hidden">
          <LocationInput value={form.location} onChange={(val) => setForm({ ...form, location: val })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location Note (optional)
        </label>
        <input type="text" value={form.locationNote}
          onChange={(e) => setForm({ ...form, locationNote: e.target.value })}
          className={inputClass} placeholder="e.g. 3rd floor, near Imtiaz store" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          What do you need? *
        </label>
        <textarea placeholder="Describe your problem (min 5 characters)" rows="3" required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputClass} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            📅 Preferred Date *
          </label>
          <input
            type="date"
            required
            min={today}
            value={form.preferredDate}
            onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            🕐 Preferred Time *
          </label>
          <input
            type="time"
            required
            value={form.preferredTime}
            onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition">
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
        <button type="button" onClick={onCancel}
          className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 px-6 rounded-lg font-semibold text-gray-800 dark:text-gray-100 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default RequestForm;
