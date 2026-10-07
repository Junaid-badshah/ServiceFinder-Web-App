import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [newProviders, setNewProviders] = useState(0);
  const [profilePic, setProfilePic] = useState(user?.profilePicture || '');

  // ============================================
  // Load profile picture + sync
  // ============================================
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const res = await api.get('/profile/me');
        setProfilePic(res.data.profilePicture || '');
      } catch (err) {
        // silent
      }
    };
    loadProfile();
  }, [user, location.pathname]);

  // ============================================
  // PROVIDER — Pending requests count (ALL providers)
  // ============================================
  useEffect(() => {
    if (!user || user.role !== 'PROVIDER') {
      setPendingCount(0);
      return;
    }
    const loadPendingCount = async () => {
      try {
        const provRes = await api.get('/providers');
        // ✅ FILTER — user ke SAARE providers
        const myProviders = (provRes.data || []).filter((p) => p.userId === user.id);
        if (myProviders.length === 0) { setPendingCount(0); return; }

        // ✅ Har provider ke pending requests count karo
        let totalPending = 0;
        for (const mp of myProviders) {
          try {
            const reqRes = await api.get(`/requests/provider/${mp.id}`);
            const pending = (reqRes.data || []).filter(
                (r) => (r.status || '').toUpperCase() === 'PENDING'
            ).length;
            totalPending += pending;
          } catch (err) {
            console.error(`Failed for provider ${mp.id}`, err);
          }
        }
        setPendingCount(totalPending);
      } catch (err) {
        console.error('Provider notification error:', err);
      }
    };
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  // ============================================
  // ADMIN — New customers + providers count
  // ============================================
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setNewCustomers(0);
      setNewProviders(0);
      return;
    }
    const loadAdminCounts = async () => {
      try {
        const [usersRes, providersRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/providers'),
        ]);
        const totalCustomers = (usersRes.data || []).filter((u) => u.role === 'CUSTOMER').length;
        const totalProviders = (providersRes.data || []).length;
        const seenCustomers = parseInt(localStorage.getItem('adminSeenCustomers') || '0');
        const seenProviders = parseInt(localStorage.getItem('adminSeenProviders') || '0');
        setNewCustomers(Math.max(0, totalCustomers - seenCustomers));
        setNewProviders(Math.max(0, totalProviders - seenProviders));
      } catch (err) {
        console.error('Admin notification error:', err);
      }
    };
    loadAdminCounts();
    const interval = setInterval(loadAdminCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ============================================
  // ADMIN — Badge clear
  // ============================================
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    const resetSeen = async () => {
      if (location.pathname === '/providers') {
        try {
          const res = await api.get('/providers');
          localStorage.setItem('adminSeenProviders', (res.data || []).length.toString());
          setNewProviders(0);
        } catch (err) {}
      }
      if (location.pathname === '/admin' && location.search.includes('tab=customers')) {
        try {
          const res = await api.get('/admin/users');
          const count = (res.data || []).filter((u) => u.role === 'CUSTOMER').length;
          localStorage.setItem('adminSeenCustomers', count.toString());
          setNewCustomers(0);
        } catch (err) {}
      }
    };
    resetSeen();
  }, [location.pathname, location.search, user]);

  if (!user) return null;
  const role = user.role;

  // ============================================
  // Links
  // ============================================
  let links = [];
  if (role === 'CUSTOMER') {
    links = [
      { to: '/home', label: 'Home' },
      { to: '/providers', label: 'Providers' },
      { to: '/my-requests', label: 'My Requests' },
    ];
  } else if (role === 'PROVIDER') {
    links = [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/add-provider', label: 'Add Service' },
      { to: '/providers', label: 'All Providers' },
    ];
  } else if (role === 'ADMIN') {
    links = [
      { to: '/admin', label: 'Admin Panel' },
      { to: '/admin?tab=customers', label: 'Customers' },
      { to: '/admin?tab=services', label: 'Services' },
      { to: '/providers', label: 'Providers' },
    ];
  }

  const isActive = (linkTo) => {
    if (linkTo === '/admin') {
      return location.pathname === '/admin' && !location.search.includes('tab=');
    }
    if (linkTo.includes('tab=customers')) {
      return location.pathname === '/admin' && location.search.includes('tab=customers');
    }
    if (linkTo.includes('tab=services')) {
      return location.pathname === '/admin' && location.search.includes('tab=services');
    }
    return location.pathname === linkTo;
  };

  const linkClass = (linkTo) =>
      `relative px-3 py-2 rounded-lg text-sm font-medium transition ${
          isActive(linkTo)
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800'
      }`;

  const NotificationBadge = ({ count }) => {
    if (!count || count === 0) return null;
    return (
        <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 animate-pulse">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  // ============================================
  // Profile Avatar Component
  // ============================================
  const ProfileButton = () => (
      <button
          onClick={() => navigate('/profile')}
          title={`${user.name} — View Profile`}
          className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        {/* Name — LEFT */}
        <span className="hidden md:inline text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[120px] truncate">
        {user.name}
      </span>

        {/* Avatar — RIGHT */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0">
          {profilePic ? (
              <img
                  src={profilePic}
                  alt={user.name}
                  className="w-full h-full object-cover"
              />
          ) : (
              <span>{user.name?.charAt(0).toUpperCase() || '?'}</span>
          )}
        </div>
      </button>
  );

  return (
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
                to={role === 'ADMIN' ? '/admin' : role === 'PROVIDER' ? '/dashboard' : '/home'}
                className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-500 flex-shrink-0"
            >
              🔧 ServiceFinder
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
              {links.map((l) => {
                let badgeCount = 0;
                if (l.to === '/dashboard' && role === 'PROVIDER') badgeCount = pendingCount;
                if (role === 'ADMIN') {
                  if (l.to === '/admin?tab=customers') badgeCount = newCustomers;
                  if (l.to === '/providers') badgeCount = newProviders;
                }
                return (
                    <Link key={l.to} to={l.to} className={linkClass(l.to)}>
                      {l.label}
                      <NotificationBadge count={badgeCount} />
                    </Link>
                );
              })}

              {/* Divider */}
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

              {/* Theme toggle */}
              <button
                  onClick={toggle}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  title="Toggle theme"
              >
                {dark ? '☀️' : '🌙'}
              </button>

              {/* Profile Avatar + Name — RIGHT SIDE */}
              <ProfileButton />
            </div>

            {/* Mobile buttons */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                {dark ? '☀️' : '🌙'}
              </button>
              <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                {menuOpen ? '✖' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
              <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                {/* Profile at top of mobile menu */}
                <button
                    onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition mb-2"
                >
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      View Profile →
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    {profilePic ? (
                        <img src={profilePic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user.name?.charAt(0).toUpperCase() || '?'}</span>
                    )}
                  </div>
                </button>

                {links.map((l) => {
                  let badgeCount = 0;
                  if (l.to === '/dashboard' && role === 'PROVIDER') badgeCount = pendingCount;
                  if (role === 'ADMIN') {
                    if (l.to === '/admin?tab=customers') badgeCount = newCustomers;
                    if (l.to === '/providers') badgeCount = newProviders;
                  }
                  return (
                      <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setMenuOpen(false)}
                          className={`block ${linkClass(l.to)}`}
                      >
                        {l.label}
                        <NotificationBadge count={badgeCount} />
                      </Link>
                  );
                })}
              </div>
          )}
        </div>
      </nav>
  );
}

export default Navbar;