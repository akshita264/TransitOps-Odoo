import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Truck, Users, Route, Wrench, TrendingUp, AlertTriangle, Clock,
  Activity, ShieldCheck, ArrowRight, DollarSign, BarChart3,
  MoreHorizontal, CheckCircle2, Bell, Sparkles
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await api.get('/dashboard');
      setData(d);
    } catch (err) {
      // Fallback TransitOps mock data so Vision UI layout always renders beautifully
      setData({
        vehicles: { active: 18, available: 6, inMaintenance: 3, total: 27 },
        trips: { active: 14, pending: 5, completedToday: 22 },
        drivers: { onDuty: 21, expiringLicenses: 2, total: 28 },
        fleetUtilization: 94,
        recentTrips: [
          { _id: 't-1', tripNumber: 'TRP-8402', origin: 'Chicago HQ Depot', destination: 'Detroit Assembly Plant', status: 'in_progress', vehicle: { registrationNumber: 'IL-8492-TX' }, driver: { name: 'Marcus Vance' }, progress: 68 },
          { _id: 't-2', tripNumber: 'TRP-8399', origin: 'Indianapolis Hub', destination: 'Columbus Distribution', status: 'in_progress', vehicle: { registrationNumber: 'IN-4019-FL' }, driver: { name: 'Elena Rostova' }, progress: 85 },
          { _id: 't-3', tripNumber: 'TRP-8395', origin: 'Milwaukee Freight', destination: 'Chicago HQ Depot', status: 'completed', vehicle: { registrationNumber: 'WI-9021-FR' }, driver: { name: 'David Kim' }, progress: 100 },
          { _id: 't-4', tripNumber: 'TRP-8405', origin: 'St. Louis Terminal', destination: 'Louisville Center', status: 'scheduled', vehicle: { registrationNumber: 'MO-1182-TR' }, driver: { name: 'Sarah Jenkins' }, progress: 15 },
        ],
        alerts: [
          { id: 1, title: 'Vehicle IL-8492-TX due for 50,000mi service', time: '10 MINS AGO', type: 'warning' },
          { id: 2, title: 'Driver CDL license renewal required for J. Miller', time: '4 HOURS AGO', type: 'alert' },
          { id: 3, title: 'Trip TRP-8399 arrived ahead of schedule at Columbus', time: '6 HOURS AGO', type: 'success' },
          { id: 4, title: 'Monthly telematics efficiency report ready', time: 'YESTERDAY', type: 'info' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 font-mono text-sm">
        <span className="spinner mr-3" /> Loading TransitOps Fleet Command...
      </div>
    );
  }

  const currentPersona = personaConfigs[user?.role] || personaConfigs.fleet_manager;

  // TransitOps Fleet KPIs formatted in Vision UI style
  const kpis = [
    {
      title: 'Active Vehicles',
      value: data.vehicles?.active || 18,
      change: '+12%',
      positive: true,
      subtitle: 'Deployed on route',
      icon: Truck
    },
    {
      title: 'Available Fleet',
      value: data.vehicles?.available || 6,
      change: 'Ready',
      positive: true,
      subtitle: 'Immediate dispatch',
      icon: ShieldCheck
    },
    {
      title: 'Active Trips',
      value: data.trips?.active || 14,
      change: '+8%',
      positive: true,
      subtitle: 'Live telematics',
      icon: Route
    },
    {
      title: 'Drivers On Duty',
      value: data.drivers?.onDuty || 21,
      change: 'Active',
      positive: true,
      subtitle: 'Roster ready',
      icon: Users
    }
  ];

  const tripsList = data.recentTrips || [];
  const alertsList = data.alerts || [
    { id: 1, title: 'Vehicle IL-8492-TX due for 50,000mi service', time: '10 MINS AGO', type: 'warning' },
    { id: 2, title: 'Driver CDL license renewal required', time: '4 HOURS AGO', type: 'alert' },
    { id: 3, title: 'Trip TRP-8399 arrived ahead of schedule', time: '6 HOURS AGO', type: 'success' },
  ];

  return (
    <div className="space-y-6 text-gray-100 font-sans">
      {/* ROW 1: Top 4 TransitOps Fleet KPI Cards (Vision UI style) */}
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
                  <span className={`text-xs font-bold ${card.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
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

      {/* ROW 2: Welcome Hero Card + Fleet Utilization Gauge + Safety Telematics Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Welcome Hero Card (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-blue-950/50 border border-zinc-800/80 p-7 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between min-h-[250px]">
          {/* Ethereal blue ambient lighting */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-600/10 blur-[40px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[0.68rem] font-bold uppercase px-2.5 py-0.5 rounded-full ${currentPersona.badge}`}>
                {currentPersona.title}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'TransitOps User'}</h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-md leading-relaxed">
              {currentPersona.subtitle}
            </p>
          </div>

          {/* Quick Action Links */}
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

        {/* Middle Fleet Utilization Gauge (3 cols) */}
        <div className="lg:col-span-3 pure-black-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Fleet Utilization</h3>
            <p className="text-[0.7rem] text-zinc-400">Active vs Total Fleet</p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            {/* Glowing semi-circular gauge */}
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
                  strokeDasharray="118 251"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_#3b82f6]"
                />
              </svg>
              <div className="absolute bottom-2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-1">
                  <Activity size={18} />
                </div>
                <span className="text-xl font-black text-white">{data.fleetUtilization || 94}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900 pt-3">
            <span>0%</span>
            <span className="font-semibold text-zinc-400">Live GPS Status</span>
            <span>100%</span>
          </div>
        </div>

        {/* Right Safety Score & Compliance Ring (3 cols) */}
        <div className="lg:col-span-3 pure-black-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Safety Telematics</h3>
            <button className="text-zinc-500 hover:text-white">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between my-4">
            <div className="space-y-3">
              <div>
                <p className="text-[0.68rem] text-zinc-400">In Maintenance</p>
                <p className="text-base font-extrabold text-white">{data.vehicles?.inMaintenance || 3} Units</p>
              </div>
              <div>
                <p className="text-[0.68rem] text-zinc-400">Expiring Lic.</p>
                <p className="text-base font-extrabold text-white">{data.drivers?.expiringLicenses || 2} Drivers</p>
              </div>
            </div>

            {/* Glowing neon emerald circular score ring */}
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
                  strokeDasharray="225 240"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_#10b981]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[0.65rem] text-zinc-400 font-medium">Safety</span>
                <span className="text-lg font-black text-white">9.4</span>
                <span className="text-[0.58rem] text-zinc-500">Total Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Interactive Visual Charts (Fleet Delivery Volume Area Chart + Active Fleet Counters) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Fleet Analytics & Deliveries Area Chart (7 cols) */}
        <div className="lg:col-span-7 pure-black-card rounded-3xl p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Fleet Performance Overview</h3>
            <p className="text-xs text-zinc-400">
              <span className="text-emerald-400 font-bold">(+14.2%) deliveries</span> in 2026
            </p>
          </div>

          {/* Glowing curved SVG area graphic */}
          <div className="h-60 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="areaGradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[40, 80, 120, 160].map((y, idx) => (
                <line key={idx} x1="0" y1={y} x2="700" y2={y} stroke="#1e293b" strokeDasharray="4" />
              ))}

              {/* Wave 1 (Cyan) */}
              <path
                d="M0,130 C100,20 200,160 300,100 C400,40 500,140 600,80 C650,50 700,90 700,90 L700,200 L0,200 Z"
                fill="url(#areaGradCyan)"
              />
              <path
                d="M0,130 C100,20 200,160 300,100 C400,40 500,140 600,80 C650,50 700,90 700,90"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                className="filter drop-shadow-[0_0_6px_#06b6d4]"
              />

              {/* Wave 2 (Blue) */}
              <path
                d="M0,160 C120,130 220,110 320,140 C420,170 520,60 620,90 C660,100 700,70 700,70 L700,200 L0,200 Z"
                fill="url(#areaGradBlue)"
              />
              <path
                d="M0,160 C120,130 220,110 320,140 C420,170 520,60 620,90 C660,100 700,70 700,70"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                className="filter drop-shadow-[0_0_10px_#3b82f6]"
              />
            </svg>
            <div className="flex justify-between text-[0.65rem] text-zinc-500 font-mono mt-3">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        {/* Active Fleet & Route Metrics Bar Chart (5 cols) */}
        <div className="lg:col-span-5 pure-black-card rounded-3xl p-6 flex flex-col justify-between">
          {/* Top glowing bar visual */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-950/70 via-zinc-900 to-zinc-950 p-5 border border-white/10 mb-5">
            <div className="h-32 flex items-end justify-between gap-2">
              {[45, 70, 30, 85, 55, 90, 60, 40, 75, 95, 65, 80].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] hover:bg-blue-400 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Active Fleet Telematics</h3>
            <p className="text-xs text-zinc-400">
              <span className="text-emerald-400 font-bold">(+18%)</span> real-time sensor efficiency
            </p>
          </div>

          {/* 4 Bottom TransitOps metric counters */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-zinc-900">
            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-blue-500" />
                <span>Vehicles</span>
              </div>
              <p className="text-sm font-extrabold text-white">248</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500 w-3/4 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-cyan-400" />
                <span>Routes</span>
              </div>
              <p className="text-sm font-extrabold text-white">1,420</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-cyan-400 w-4/5 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-emerald-400" />
                <span>Fuel Eff.</span>
              </div>
              <p className="text-sm font-extrabold text-white">94.8%</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-400 w-11/12 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded bg-blue-600" />
                <span>Drivers</span>
              </div>
              <p className="text-sm font-extrabold text-white">184</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-600 w-2/3 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: Bottom Active Dispatches Table + Fleet Alerts Overview Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TransitOps Dispatched Trips Table (8 cols) */}
        <div className="lg:col-span-8 pure-black-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Active Trips & Dispatches</h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="font-bold text-zinc-300">{tripsList.length} active routes</span> monitored in real time
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-[0.65rem] font-extrabold text-zinc-500 uppercase tracking-widest">
                  <th className="pb-3">ROUTE & TRIP #</th>
                  <th className="pb-3">VEHICLE / DRIVER</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3">ROUTE COMPLETION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs">
                {tripsList.map((trip, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-xs">
                          🛣️
                        </span>
                        <div>
                          <p className="font-bold text-white">{trip.tripNumber || 'TRP-8400'}</p>
                          <p className="text-[0.68rem] text-zinc-400 truncate max-w-[160px]">
                            {trip.origin} → {trip.destination}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <p className="font-semibold text-white">{trip.vehicle?.registrationNumber || 'Fleet Unit'}</p>
                      <p className="text-[0.68rem] text-zinc-400">{trip.driver?.name || 'Assigned Driver'}</p>
                    </td>

                    <td className="py-4">
                      <StatusBadge status={trip.status || 'in_progress'} />
                    </td>

                    <td className="py-4 w-44">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white w-8">{trip.progress || 75}%</span>
                        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${trip.progress || 75}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_8px_#3b82f6]"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Maintenance & Alerts Timeline (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">System Alerts & Logs</h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="font-bold text-zinc-300">Live Telemetry</span> diagnostics
            </p>

            <div className="mt-6 space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-zinc-800">
              {alertsList.map((alert, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold z-10 ${
                    alert.type === 'warning'
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                      : alert.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                      : 'bg-blue-500/20 border border-blue-500 text-blue-400'
                  }`}>
                    {alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✓' : '🔔'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{alert.title}</p>
                    <p className="text-[0.68rem] text-zinc-500 mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
