import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart3, LogOut, Menu, X, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { to: '/vehicles', icon: Truck, label: 'Vehicles', roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { to: '/drivers', icon: Users, label: 'Drivers', roles: ['fleet_manager', 'dispatcher', 'safety_officer'] },
  { to: '/trips', icon: Route, label: 'Trips', roles: ['fleet_manager', 'dispatcher', 'safety_officer'] },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance', roles: ['fleet_manager', 'dispatcher'] },
  { to: '/fuel-expenses', icon: Fuel, label: 'Fuel & Expenses', roles: ['fleet_manager', 'financial_analyst', 'dispatcher'] },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['fleet_manager', 'financial_analyst', 'safety_officer'] },
];

const personaMetadata = {
  fleet_manager: {
    title: 'Fleet Manager',
    badgeClass: 'bg-green/15 text-green border border-green/30',
    desc: 'Fleet assets & lifecycle',
  },
  dispatcher: {
    title: 'Dispatcher',
    badgeClass: 'bg-blue/15 text-blue border border-blue/30',
    desc: 'Trip lifecycle & dispatch',
  },
  safety_officer: {
    title: 'Safety Officer',
    badgeClass: 'bg-amber/15 text-amber border border-amber/30',
    desc: 'Driver compliance & safety',
  },
  financial_analyst: {
    title: 'Financial Analyst',
    badgeClass: 'bg-purple/15 text-purple border border-purple/30',
    desc: 'Operational costs & ROI',
  },
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPersona = personaMetadata[user?.role] || {
    title: user?.role || 'User',
    badgeClass: 'bg-gray-400/15 text-gray-300 border border-gray-400/30',
    desc: 'TransitOps User',
  };

  const visibleNavItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="flex min-h-screen bg-black text-gray-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Pure Black */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        flex flex-col
        bg-black
        border-r border-white/10
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-white/10">
          {!collapsed ? (
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight leading-tight">TransitOps</h1>
                <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-400 uppercase tracking-wider">PRO</span>
              </div>
              <p className="text-[0.68rem] text-gray-400 tracking-wider uppercase font-medium">Smart Fleet Platform</p>
            </div>
          ) : (
            <span className="text-xs font-black text-white uppercase mx-auto">TO</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3.5 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold
                transition-all duration-200 group
                ${isActive
                  ? 'bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] font-bold border border-blue-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={20} className="flex-shrink-0 transition-transform group-hover:scale-110 duration-200" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10 bg-black">
          {!collapsed && (
            <div className="mb-3 px-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded-md ${currentPersona.badgeClass}`}>
                  {currentPersona.title}
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentPersona.desc}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
              text-gray-400 hover:text-red hover:bg-red/10 transition-all duration-200 cursor-pointer
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-black border border-white/20 items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors"
        >
          <ChevronRight size={12} className={`text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-black">
        {/* Top bar - Pure Black */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden btn-icon cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 hidden sm:inline">Fleet Command</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">Active Persona:</span>
              <span className={`text-xs font-bold uppercase px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm ${currentPersona.badgeClass}`}>
                <ShieldCheck size={14} />
                {currentPersona.title}
              </span>
            </div>
            <div className="h-5 w-[1px] bg-white/[0.08] hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
                <p className="text-[0.68rem] text-gray-400">{currentPersona.title}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center text-dark-900 text-sm font-extrabold shadow-md shadow-accent/20">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
