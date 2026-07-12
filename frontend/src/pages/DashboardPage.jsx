import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Truck, Users, Route, Wrench, TrendingUp, AlertTriangle, Clock, Activity, ShieldCheck, ArrowRight, PlusCircle, DollarSign, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import StatusBadge from '../components/StatusBadge';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const personaConfigs = {
  fleet_manager: {
    title: 'Fleet Manager',
    subtitle: 'Oversees fleet assets, maintenance schedules, vehicle lifecycle & overall operational efficiency.',
    badge: 'bg-green/15 text-green border-green/30',
    goals: 'Maximize fleet uptime, minimize maintenance costs, ensure regulatory compliance & optimize asset utilization.',
    quickLinks: [
      { to: '/vehicles', label: 'Manage Fleet Assets', icon: Truck },
      { to: '/maintenance', label: 'Maintenance Schedules', icon: Wrench },
      { to: '/reports', label: 'Operational Efficiency', icon: BarChart3 },
    ],
  },
  dispatcher: {
    title: 'Driver / Dispatcher',
    subtitle: 'Creates and manages trips, assigns vehicles & drivers, and monitors active deliveries.',
    badge: 'bg-blue/15 text-blue border-blue/30',
    goals: 'Efficiently schedule & dispatch trips, match drivers with vehicles & monitor real-time trip lifecycle.',
    quickLinks: [
      { to: '/trips', label: 'Dispatch & Trips', icon: Route },
      { to: '/vehicles', label: 'Vehicle Availability', icon: Truck },
      { to: '/drivers', label: 'Driver Duty Roster', icon: Users },
    ],
  },
  safety_officer: {
    title: 'Safety Officer',
    subtitle: 'Ensures driver compliance with regulations, tracks license validity & monitors safety scores.',
    badge: 'bg-amber/15 text-amber border-amber/30',
    goals: 'Maintain compliant & safe driver workforce, prevent license lapses & track safety incidents.',
    quickLinks: [
      { to: '/drivers', label: 'Driver Compliance & Licenses', icon: Users },
      { to: '/reports', label: 'Safety Performance', icon: ShieldCheck },
    ],
  },
  financial_analyst: {
    title: 'Financial Analyst',
    subtitle: 'Reviews operational expenses, fuel consumption, maintenance costs & overall fleet profitability.',
    badge: 'bg-purple/15 text-purple border-purple/30',
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
  const [filters, setFilters] = useState({ type: '', region: '' });

  useEffect(() => {
    fetchDashboard();
  }, [filters]);

  const fetchDashboard = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.region) params.region = filters.region;
      const { data: d } = await api.get('/dashboard', { params });
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><span className="spinner" /> Loading dashboard...</div>;
  if (!data) return null;

  const currentPersona = personaConfigs[user?.role] || personaConfigs.fleet_manager;

  const kpis = [
    { label: 'Active Vehicles', value: data.vehicles.active, icon: Truck, color: 'text-blue', bg: 'bg-blue/15 border-blue/30', trend: '+12.4%', trendPositive: true, desc: 'Currently deployed' },
    { label: 'Available Vehicles', value: data.vehicles.available, icon: Truck, color: 'text-accent', bg: 'bg-accent/15 border-accent/30', trend: 'Ready', trendPositive: true, desc: 'Immediate dispatch' },
    { label: 'In Maintenance', value: data.vehicles.inMaintenance, icon: Wrench, color: 'text-amber', bg: 'bg-amber/15 border-amber/30', trend: 'Sched', trendPositive: false, desc: 'Shop / servicing' },
    { label: 'Active Trips', value: data.trips.active, icon: Route, color: 'text-purple', bg: 'bg-purple/15 border-purple/30', trend: 'On Route', trendPositive: true, desc: 'Live telematics' },
    { label: 'Pending Trips', value: data.trips.pending, icon: Clock, color: 'text-gray-300', bg: 'bg-gray-400/15 border-gray-400/30', trend: 'Queue', trendPositive: true, desc: 'Awaiting dispatch' },
    { label: 'Drivers On Duty', value: data.drivers.onDuty, icon: Users, color: 'text-cyan', bg: 'bg-cyan/15 border-cyan/30', trend: 'Active', trendPositive: true, desc: 'Roster ready' },
    { label: 'Fleet Utilization', value: `${data.fleetUtilization}%`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/15 border-accent/30', trend: '+4.2%', trendPositive: true, desc: 'Efficiency score' },
    { label: 'Expiring Licenses', value: data.drivers.expiringLicenses, icon: AlertTriangle, color: 'text-red', bg: 'bg-red/15 border-red/30', trend: 'Action Req', trendPositive: false, desc: 'Next 30 days' },
  ];

  const statusChartData = {
    labels: (data.vehicles.byStatus || []).map(s => s._id),
    datasets: [{
      data: (data.vehicles.byStatus || []).map(s => s.count),
      backgroundColor: ['#06d6a0', '#4361ee', '#f6a609', '#6b7fa3'],
      borderWidth: 0,
      borderRadius: 4,
    }],
  };

  const typeChartData = {
    labels: (data.vehicles.byType || []).map(t => t._id),
    datasets: [{
      label: 'Vehicles',
      data: (data.vehicles.byType || []).map(t => t.count),
      backgroundColor: 'rgba(6, 214, 160, 0.6)',
      borderColor: '#06d6a0',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8b9dc0', font: { size: 12 } },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: '#6b7fa3' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#6b7fa3' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Persona Welcome Banner */}
      <div className="glass-card p-6 border border-white/[0.1] relative overflow-hidden bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border shadow-sm ${currentPersona.badge}`}>
                Persona: {currentPersona.title}
              </span>
              <span className="text-xs font-medium text-gray-400">| Live Operations Control Center</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Welcome back, {user?.name}</h2>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">{currentPersona.subtitle}</p>
            <p className="text-xs text-accent font-medium">Primary Focus: {currentPersona.goals}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {currentPersona.quickLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="btn btn-secondary text-xs font-semibold flex items-center gap-2.5 px-3.5 py-2 hover:border-accent/50 hover:bg-white/[0.08]"
              >
                <Icon size={15} className="text-accent" />
                {label}
                <ArrowRight size={13} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card px-4 py-3 flex items-center justify-between border border-white/[0.06]">
          <div>
            <p className="text-[0.68rem] text-gray-400 font-semibold uppercase tracking-wider">System Uptime</p>
            <p className="text-sm font-bold text-white mt-0.5">99.98% <span className="text-xs text-accent font-normal">(Optimal)</span></p>
          </div>
          <Activity size={18} className="text-accent" />
        </div>
        <div className="glass-card px-4 py-3 flex items-center justify-between border border-white/[0.06]">
          <div>
            <p className="text-[0.68rem] text-gray-400 font-semibold uppercase tracking-wider">Fleet Efficiency</p>
            <p className="text-sm font-bold text-white mt-0.5">94.2 / 100 <span className="text-xs text-accent font-normal">(Top Tier)</span></p>
          </div>
          <TrendingUp size={18} className="text-cyan" />
        </div>
        <div className="glass-card px-4 py-3 flex items-center justify-between border border-white/[0.06]">
          <div>
            <p className="text-[0.68rem] text-gray-400 font-semibold uppercase tracking-wider">Dispatch Latency</p>
            <p className="text-sm font-bold text-white mt-0.5">1.1 min <span className="text-xs text-green font-normal">(Fast)</span></p>
          </div>
          <Clock size={18} className="text-green" />
        </div>
        <div className="glass-card px-4 py-3 flex items-center justify-between border border-white/[0.06]">
          <div>
            <p className="text-[0.68rem] text-gray-400 font-semibold uppercase tracking-wider">Safety Index</p>
            <p className="text-sm font-bold text-white mt-0.5">98.6% <span className="text-xs text-accent font-normal">(Compliant)</span></p>
          </div>
          <ShieldCheck size={18} className="text-accent" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Fleet Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">Real-time operational dashboard & metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filters.type}
            onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
            className="input-field w-auto text-sm"
          >
            <option value="">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Bus">Bus</option>
            <option value="Car">Car</option>
          </select>
          <select
            value={filters.region}
            onChange={(e) => setFilters(f => ({ ...f, region: e.target.value }))}
            className="input-field w-auto text-sm"
          >
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, trend, trendPositive, desc }) => (
          <div key={label} className="glass-card glass-card-interactive p-5 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl border ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${
                trendPositive ? 'bg-accent/15 text-accent' : 'bg-red/15 text-red'
              }`}>
                {trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
              <p className="text-xs font-semibold text-gray-300 mt-1">{label}</p>
              <p className="text-[0.7rem] text-gray-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Vehicle Status Distribution</h3>
          <div className="h-64">
            <Doughnut data={statusChartData} options={{ ...chartOptions, cutout: '65%' }} />
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Vehicles by Type</h3>
          <div className="h-64">
            <Bar data={typeChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Trips</h3>
        {data.trips.recent?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.trips.recent.map(trip => (
                  <tr key={trip._id}>
                    <td className="font-medium text-white">{trip.source} → {trip.destination}</td>
                    <td>{trip.vehicle?.registrationNumber || '—'}</td>
                    <td>{trip.driver?.name || '—'}</td>
                    <td><StatusBadge status={trip.status} /></td>
                    <td className="text-gray-400 text-xs">{new Date(trip.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No trips yet</p>
        )}
      </div>
    </div>
  );
}
