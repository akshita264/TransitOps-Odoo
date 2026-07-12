import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Truck, Users, Route, Wrench, TrendingUp, AlertTriangle, Clock,
  Activity, ShieldCheck, ArrowRight, DollarSign, BarChart3,
  MoreHorizontal, CheckCircle2, Bell, Sparkles, Fuel
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const personaConfigs = {
  fleet_manager: {
    title: 'Fleet Manager',
    subtitle: 'Oversees fleet assets, maintenance schedules, vehicle lifecycle & overall operational efficiency.',
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    goals: 'Maximize fleet uptime, minimize maintenance costs & ensure regulatory compliance.',
    quickLinks: [
      { to: '/vehicles', label: 'Manage Fleet Assets', icon: Truck },
      { to: '/maintenance', label: 'Maintenance Schedules', icon: Wrench },
      { to: '/reports', label: 'Operational Analytics', icon: BarChart3 },
    ],
  },
  dispatcher: {
    title: 'Driver / Dispatcher',
    subtitle: 'Creates and manages trips, assigns vehicles & drivers, and monitors active deliveries.',
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    goals: 'Efficiently schedule trips, match drivers with vehicles & monitor real-time telematics.',
    quickLinks: [
      { to: '/trips', label: 'Dispatch & Active Trips', icon: Route },
      { to: '/vehicles', label: 'Vehicle Availability', icon: Truck },
      { to: '/drivers', label: 'Driver Duty Roster', icon: Users },
    ],
  },
  safety_officer: {
    title: 'Safety Officer',
    subtitle: 'Ensures driver compliance with regulations, tracks license validity & monitors safety scores.',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    goals: 'Maintain compliant workforce, prevent license lapses & track safety telemetry.',
    quickLinks: [
      { to: '/drivers', label: 'Driver Compliance & Licenses', icon: Users },
      { to: '/reports', label: 'Safety Performance', icon: ShieldCheck },
    ],
  },
  financial_analyst: {
    title: 'Financial Analyst',
    subtitle: 'Reviews operational expenses, fuel consumption, maintenance costs & overall fleet profitability.',
    badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    goals: 'Identify cost-saving opportunities, track ROI per vehicle & correlate operations with financial outcomes.',
    quickLinks: [
      { to: '/fuel-expenses', label: 'Fuel Logs & Expenses', icon: DollarSign },
      { to: '/reports', label: 'ROI & Profitability Reports', icon: BarChart3 },
    ],
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get('/dashboard');
      setData(d);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard records:', err);
      setError(err.response?.data?.message || 'Failed to fetch live dashboard records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 font-mono text-sm">
        <span className="spinner mr-3" /> Loading live database records...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 pure-black-card rounded-3xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle size={36} className="text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Could Not Load Records</h3>
        <p className="text-xs text-zinc-400 mb-4">{error || 'Database connection error'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Retry Fetching
        </button>
      </div>
    );
  }

  const currentPersona = personaConfigs[user?.role] || personaConfigs.fleet_manager;

  // Real KPI Cards dynamically calculated from backend records
  const totalVehicles = data.vehicles?.total ?? 0;
  const activeVehicles = data.vehicles?.active ?? 0;
  const availableVehicles = data.vehicles?.available ?? 0;
  const inMaintenance = data.vehicles?.inMaintenance ?? 0;

  const totalTrips = data.trips?.total ?? 0;
  const activeTrips = data.trips?.active ?? 0;
  const completedTrips = data.trips?.completed ?? 0;
  const pendingTrips = data.trips?.pending ?? 0;

  const totalDrivers = data.drivers?.total ?? 0;
  const driversOnDuty = data.drivers?.onDuty ?? 0;
  const expiringLicenses = data.drivers?.expiringLicenses ?? 0;

  const totalFuelCost = data.fuel?.totalCost ?? 0;
  const totalFuelLiters = data.fuel?.totalLiters ?? 0;

  const fleetUtilization = Math.min(100, Math.max(0, data.fleetUtilization ?? 0));
  const utilDash = Math.round((fleetUtilization / 100) * 251);

  const operationalRatio = totalVehicles > 0
    ? Math.round(((totalVehicles - inMaintenance) / totalVehicles) * 100)
    : 100;
  const opDash = Math.round((operationalRatio / 100) * 240);

  const kpis = [
    {
      title: 'Active Vehicles',
      value: activeVehicles,
      change: `${totalVehicles} Total`,
      positive: true,
      subtitle: `${availableVehicles} Available for dispatch`,
      icon: Truck
    },
    {
      title: 'Fleet Trips',
      value: totalTrips,
      change: `${activeTrips} Dispatched`,
      positive: true,
      subtitle: `${completedTrips} Completed · ${pendingTrips} Draft`,
      icon: Route
    },
    {
      title: 'Drivers On Duty',
      value: driversOnDuty,
      change: `${totalDrivers} Registered`,
      positive: true,
      subtitle: `${data.drivers?.available ?? 0} Available roster`,
      icon: Users
    },
    {
      title: 'Fuel Expenses',
      value: `$${totalFuelCost.toLocaleString()}`,
      change: `${totalFuelLiters.toLocaleString()} L`,
      positive: true,
      subtitle: 'Recorded fuel spend',
      icon: Fuel
    }
  ];

  const tripsList = data.trips?.recent || [];
  const maintenanceList = data.recentMaintenance || [];
  const monthlyTrips = data.trips?.monthly || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const maxMonthly = Math.max(1, ...monthlyTrips);

  // Dynamically generate SVG path coordinates for the 12 months (Jan-Dec)
  const chartWidth = 700;
  const chartTop = 25;
  const chartBottom = 180;
  const stepX = chartWidth / 11;

  const points = monthlyTrips.map((count, idx) => {
    const x = idx * stepX;
    const normalizedHeight = count / maxMonthly;
    const y = chartBottom - normalizedHeight * (chartBottom - chartTop);
    return { x, y };
  });

  // Smooth bezier curve generator for dynamic monthly data
  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${chartWidth},200 L 0,200 Z`;

  // Dynamic progress percentages for Live Database Summary
  const vehicleActivePct = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
  const tripsCompletedPct = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;
  const driverDutyPct = totalDrivers > 0 ? Math.round((driversOnDuty / totalDrivers) * 100) : 0;

  return (
    <div className="space-y-6 text-gray-100 font-sans">
      {/* ROW 1: Dynamically Calculated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`animate-card-${idx} pure-black-card rounded-3xl p-5 flex items-center justify-between cursor-pointer`}
            >
              <div>
                <p className="text-xs font-semibold text-zinc-400">{card.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-white">{card.value}</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {card.change}
                  </span>
                </div>
                <p className="text-[0.68rem] text-zinc-500 mt-0.5">{card.subtitle}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_16px_rgba(37,99,235,0.45)]">
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ROW 2: Welcome Hero + Dynamic Fleet Utilization Gauge + Operational Status Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Hero Card (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-blue-950/50 border border-zinc-800/80 p-7 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between min-h-[250px]">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-600/10 blur-[40px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[0.68rem] font-bold uppercase px-2.5 py-0.5 rounded-full ${currentPersona.badge}`}>
                {currentPersona.title}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Enterprise User'}</h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-md leading-relaxed">
              {currentPersona.subtitle}
            </p>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
            {currentPersona.quickLinks.map((ql, idx) => {
              const QIcon = ql.icon;
              return (
                <Link
                  key={idx}
                  to={ql.to}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-bold text-zinc-200 hover:text-white hover:border-blue-500/50 transition-all"
                >
                  <QIcon size={14} className="text-blue-400" />
                  <span>{ql.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dynamic Fleet Utilization Gauge (3 cols) */}
        <div className="lg:col-span-3 pure-black-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Fleet Utilization</h3>
            <p className="text-[0.7rem] text-zinc-400">Active vs Total Fleet Records</p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-36 h-20 flex items-end justify-center overflow-hidden">
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="10"
                  strokeDasharray="125 251"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeDasharray={`${utilDash} 251`}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_#3b82f6] transition-all duration-1000"
                />
              </svg>
              <div className="absolute bottom-2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-1">
                  <Activity size={18} />
                </div>
                <span className="text-xl font-black text-white">{fleetUtilization}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900 pt-3">
            <span>0%</span>
            <span className="font-semibold text-zinc-400">Real-time GPS Ratio</span>
            <span>100%</span>
          </div>
        </div>

        {/* Dynamic Operational Status Score Ring (3 cols) */}
        <div className="lg:col-span-3 pure-black-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Operational Status</h3>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{operationalRatio}% Ready</span>
          </div>

          <div className="flex items-center justify-between my-4">
            <div className="space-y-3">
              <div>
                <p className="text-[0.68rem] text-zinc-400">In Maintenance</p>
                <p className="text-base font-extrabold text-white">{inMaintenance} Units</p>
              </div>
              <div>
                <p className="text-[0.68rem] text-zinc-400">Expiring Lic.</p>
                <p className="text-base font-extrabold text-white">{expiringLicenses} Drivers</p>
              </div>
            </div>

            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${opDash} 240`}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_#10b981] transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[0.65rem] text-zinc-400 font-medium">Uptime</span>
                <span className="text-base font-black text-white">{operationalRatio}%</span>
                <span className="text-[0.58rem] text-zinc-500">Fleet Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Dynamic Visual Charts (Fleet Dispatch Area Chart + Live Database Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dynamic Fleet Dispatch & Performance Area Chart (7 cols) */}
        <div className="lg:col-span-7 pure-black-card rounded-3xl p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Fleet Dispatch & Monthly Overview</h3>
            <p className="text-xs text-zinc-400">
              Dynamically rendering <span className="text-emerald-400 font-bold">{totalTrips} logged trips</span> across months
            </p>
          </div>

          <div className="h-60 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[40, 80, 120, 160].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="700" y2={y} stroke="#1e293b" strokeDasharray="4" />
              ))}

              <path
                d={areaPath}
                fill="url(#areaGradBlue)"
                className="transition-all duration-700"
              />
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                className="filter drop-shadow-[0_0_10px_#3b82f6] transition-all duration-700"
              />

              {/* Render dynamic monthly data nodes */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-cyan-400 stroke-black stroke-2"
                />
              ))}
            </svg>
            <div className="flex justify-between text-[0.65rem] text-zinc-500 font-mono mt-3">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, idx) => (
                <span key={idx} className={monthlyTrips[idx] > 0 ? 'text-blue-400 font-bold' : ''}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Database Summary & Monthly Activity Bars (5 cols) */}
        <div className="lg:col-span-5 pure-black-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="rounded-2xl bg-gradient-to-br from-blue-950/70 via-zinc-900 to-zinc-950 p-5 border border-white/10 mb-5">
            <div className="h-32 flex items-end justify-between gap-2">
              {monthlyTrips.map((val, idx) => {
                const barHeightPct = Math.max(10, Math.round((val / maxMonthly) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1" title={`${val} trips`}>
                    <div
                      style={{ height: `${barHeightPct}%` }}
                      className="w-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] hover:bg-blue-400 transition-all duration-700"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Live Database Summary</h3>
            <p className="text-xs text-zinc-400">
              Real-time activity ratios across all modules
            </p>
          </div>

          {/* 4 Bottom Real Ratios */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-zinc-900">
            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-blue-500" />
                <span>Vehicles</span>
              </div>
              <p className="text-sm font-extrabold text-white">{totalVehicles}</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${vehicleActivePct}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-700" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-cyan-400" />
                <span>Trips</span>
              </div>
              <p className="text-sm font-extrabold text-white">{totalTrips}</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${tripsCompletedPct}%` }} className="h-full bg-cyan-400 rounded-full transition-all duration-700" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-emerald-400" />
                <span>Fuel Cost</span>
              </div>
              <p className="text-sm font-extrabold text-white">${totalFuelCost.toLocaleString()}</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div style={{ width: '100%' }} className="h-full bg-emerald-400 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-blue-600" />
                <span>Drivers</span>
              </div>
              <p className="text-sm font-extrabold text-white">{totalDrivers}</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${driverDutyPct}%` }} className="h-full bg-blue-600 rounded-full transition-all duration-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: Real Database Trips Table + Maintenance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dispatched Trips Table (8 cols) */}
        <div className="lg:col-span-8 pure-black-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Recent Trips in Database</h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="font-bold text-zinc-300">{tripsList.length} trip records</span> loaded directly from records
              </p>
            </div>
            <Link
              to="/trips"
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {tripsList.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No trip records found in database yet. Create a trip from the Trips page to see it live here.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-[0.65rem] font-extrabold text-zinc-500 uppercase tracking-widest">
                    <th className="pb-3">ROUTE & TRIP #</th>
                    <th className="pb-3">VEHICLE / DRIVER</th>
                    <th className="pb-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {tripsList.map((trip, idx) => (
                    <tr key={trip._id || idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-xs">
                            🛣️
                          </span>
                          <div>
                            <p className="font-bold text-white">TRP-{(trip._id || '').toString().slice(-4).toUpperCase()}</p>
                            <p className="text-[0.68rem] text-zinc-400 truncate max-w-[180px]">
                              {trip.source || 'Origin'} → {trip.destination || 'Destination'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4">
                        <p className="font-semibold text-white">{trip.vehicle?.registrationNumber || 'Unassigned'}</p>
                        <p className="text-[0.68rem] text-zinc-400">{trip.driver?.name || 'Unassigned Driver'}</p>
                      </td>

                      <td className="py-4">
                        <StatusBadge status={trip.status || 'Draft'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Real Maintenance & License Alerts (4 cols) */}
        <div className="lg:col-span-4 pure-black-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Open Maintenance & Alerts</h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="font-bold text-zinc-300">{maintenanceList.length} open maintenance logs</span>
            </p>

            <div className="mt-6 space-y-5">
              {maintenanceList.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  All fleet vehicles operational — no open maintenance tickets.
                </div>
              ) : (
                maintenanceList.map((m, idx) => (
                  <div key={m._id || idx} className="flex items-start gap-3 border-b border-zinc-900/80 pb-3 last:border-0">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs">
                      ⚠️
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {m.vehicle?.registrationNumber || 'Vehicle'}: {m.issue || m.serviceType || 'Maintenance Required'}
                      </p>
                      <p className="text-[0.68rem] text-zinc-500 mt-0.5">
                        {m.priority ? `Priority: ${m.priority}` : 'Open Log'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
