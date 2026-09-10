import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ children, onQuickAction }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const navGroups = [
    {
      title: 'Core',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: 'grid_view', roles: ['SALES', 'OPERATIONS', 'TRAINER', 'FINANCE', 'MANAGEMENT'] }
      ]
    },
    {
      title: 'CRM',
      items: [
        { name: 'Leads', path: '/leads', icon: 'person_search', roles: ['SALES', 'MANAGEMENT'] },
        { name: 'Customers', path: '/customers', icon: 'groups', roles: ['SALES', 'MANAGEMENT', 'OPERATIONS', 'FINANCE'] },
        { name: 'Follow-ups', path: '/followups', icon: 'ring_volume', roles: ['SALES', 'MANAGEMENT'] },
      ]
    },
    {
      title: 'Training',
      items: [
        { name: 'Courses & Programs', path: '/programs', icon: 'menu_book', roles: ['OPERATIONS', 'MANAGEMENT', 'SALES'] },
        { name: 'Pending Assignment', path: '/pending-assignments', icon: 'assignment_ind', roles: ['OPERATIONS', 'MANAGEMENT'] },
        { name: user?.role === 'TRAINER' ? 'My Batches' : 'Batches', path: '/batches', icon: 'layers', roles: ['OPERATIONS', 'MANAGEMENT', 'TRAINER'] },
        { name: 'Trainers', path: '/trainers', icon: 'co_present', roles: ['OPERATIONS', 'MANAGEMENT'] },
        { name: user?.role === 'TRAINER' ? 'My Students' : 'Students', path: '/students', icon: 'school', roles: ['OPERATIONS', 'MANAGEMENT', 'TRAINER'] },
        { name: 'Attendance', path: '/attendance', icon: 'fact_check', roles: ['OPERATIONS', 'MANAGEMENT', 'TRAINER'] },
      ]
    },
    {
      title: 'Sales & Billing',
      items: [
        { name: 'Invoices', path: '/invoices', icon: 'receipt_long', roles: ['FINANCE', 'MANAGEMENT', 'SALES'] },
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Payments', path: '/payments', icon: 'payments', roles: ['FINANCE', 'MANAGEMENT'] },
        { name: 'Expenses', path: '/expenses', icon: 'shopping_bag', roles: ['FINANCE', 'MANAGEMENT', 'OPERATIONS'] },
        { name: 'Profitability', path: '/profitability', icon: 'insights', roles: ['FINANCE', 'MANAGEMENT'] },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-sans antialiased text-[#0b1c30]">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-slate-200/80">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Logo */}
          <div className="h-16 px-4 flex items-center gap-3 shrink-0 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 text-white font-bold">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
                Edu<span className="text-blue-600">Flow</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-semibold">ERP Enterprise</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter(
                (item) => !user || user.role === 'MANAGEMENT' || item.roles.includes(user?.role)
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {group.title}
                  </span>
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#131b2e] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 shrink-0 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-sm relative">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Amit Saxena'}</span>
                <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase truncate">
                  {user?.role || 'MANAGEMENT'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 bottom-12 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 font-semibold hover:bg-red-50 rounded-lg transition"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* TOP HEADER */}
      <div className="pl-[240px]">
        <header className="fixed top-0 left-[240px] right-0 h-16 bg-white/90 backdrop-blur-xl shadow-sm z-40 px-6 flex items-center justify-between gap-4 border-b border-slate-200/80">
          {/* Global Search Bar */}
          <div className="flex items-center flex-1 max-w-md">
            <div className="flex items-center w-full bg-slate-100/80 rounded-xl px-3 py-1.5 gap-2 text-slate-500 border border-slate-200/60">
              <span className="material-symbols-outlined text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, customers, batches, invoices..."
                className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Active User Role Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Role: {user?.role || 'MANAGEMENT'}</span>
            </div>

          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="pt-16 min-h-screen p-6 bg-[#f8f9ff]">
          {children}
        </main>
      </div>
    </div>
  );
}
