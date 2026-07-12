import { useState, useEffect } from 'react';
import api from '../api';
import { Download, TrendingUp, Fuel, DollarSign, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ReportsPage() {
  const [fuelEfficiency, setFuelEfficiency] = useState([]);
  const [operationalCost, setOperationalCost] = useState([]);
  const [vehicleROI, setVehicleROI] = useState([]);
  const [fleetUtil, setFleetUtil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('fuel-efficiency');

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const [fe, oc, roi, fu] = await Promise.all([
        api.get('/reports/fuel-efficiency'),
        api.get('/reports/operational-cost'),
        api.get('/reports/vehicle-roi'),
        api.get('/reports/fleet-utilization'),
      ]);
      setFuelEfficiency(fe.data);
      setOperationalCost(oc.data);
      setVehicleROI(roi.data);
      setFleetUtil(fu.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async (type) => {
    try {
      const { data } = await api.get(`/reports/export/csv?type=${type}`, { responseType: 'blob' });
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (loading) return <div className="loading-screen"><span className="spinner" /> Loading reports...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#8b9dc0', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#6b7fa3', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#6b7fa3' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  const fuelChartData = {
    labels: fuelEfficiency.map(v => v.registrationNumber),
    datasets: [{
      label: 'km/L',
      data: fuelEfficiency.map(v => v.efficiency),
      backgroundColor: 'rgba(6, 214, 160, 0.6)',
      borderColor: '#06d6a0',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const costChartData = {
    labels: operationalCost.filter(v => v.totalCost > 0).map(v => v.registrationNumber),
    datasets: [
      { label: 'Fuel', data: operationalCost.filter(v => v.totalCost > 0).map(v => v.fuelCost), backgroundColor: 'rgba(17, 138, 178, 0.7)', borderRadius: 4 },
      { label: 'Maintenance', data: operationalCost.filter(v => v.totalCost > 0).map(v => v.maintenanceCost), backgroundColor: 'rgba(246, 166, 9, 0.7)', borderRadius: 4 },
      { label: 'Other', data: operationalCost.filter(v => v.totalCost > 0).map(v => v.otherExpenses), backgroundColor: 'rgba(123, 44, 191, 0.7)', borderRadius: 4 },
    ],
  };

  const utilChartData = fleetUtil ? {
    labels: ['On Trip', 'Available', 'In Shop'],
    datasets: [{
      data: [fleetUtil.onTrip, fleetUtil.available, fleetUtil.inShop],
      backgroundColor: ['#4361ee', '#06d6a0', '#f6a609'],
      borderWidth: 0,
    }],
  } : null;

  const tabs = [
    { key: 'fuel-efficiency', label: 'Fuel Efficiency', icon: Fuel },
    { key: 'operational-cost', label: 'Operational Cost', icon: DollarSign },
    { key: 'vehicle-roi', label: 'Vehicle ROI', icon: TrendingUp },
    { key: 'fleet-utilization', label: 'Fleet Utilization', icon: BarChart3 },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Operational insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV('vehicles')} className="btn btn-sm btn-secondary cursor-pointer"><Download size={14} /> Vehicles CSV</button>
          <button onClick={() => exportCSV('trips')} className="btn btn-sm btn-secondary cursor-pointer"><Download size={14} /> Trips CSV</button>
          <button onClick={() => exportCSV('fuel')} className="btn btn-sm btn-secondary cursor-pointer"><Download size={14} /> Fuel CSV</button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveReport(key)}
            className={`btn btn-sm ${activeReport === key ? 'btn-primary' : 'btn-secondary'} cursor-pointer`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Fuel Efficiency */}
      {activeReport === 'fuel-efficiency' && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Fuel Efficiency by Vehicle (km/L)</h3>
            <div className="h-72">
              <Bar data={fuelChartData} options={chartOptions} />
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Vehicle</th><th>Type</th><th>Total Distance (km)</th><th>Total Fuel (L)</th><th>Efficiency (km/L)</th></tr></thead>
              <tbody>
                {fuelEfficiency.map(v => (
                  <tr key={v.vehicleId}>
                    <td className="font-mono text-white">{v.registrationNumber}</td>
                    <td>{v.type}</td>
                    <td>{v.totalDistance.toLocaleString()}</td>
                    <td>{v.totalFuel.toLocaleString()}</td>
                    <td className={`font-bold ${v.efficiency >= 8 ? 'text-green' : v.efficiency >= 5 ? 'text-amber' : 'text-red'}`}>{v.efficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operational Cost */}
      {activeReport === 'operational-cost' && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Cost Breakdown by Vehicle</h3>
            <div className="h-72">
              <Bar data={costChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, x: { ...chartOptions.scales.x, stacked: true }, y: { ...chartOptions.scales.y, stacked: true } } }} />
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Vehicle</th><th>Fuel Cost</th><th>Maintenance</th><th>Other</th><th>Total</th></tr></thead>
              <tbody>
                {operationalCost.map(v => (
                  <tr key={v.vehicleId}>
                    <td className="font-mono text-white">{v.registrationNumber}</td>
                    <td>${v.fuelCost.toLocaleString()}</td>
                    <td>${v.maintenanceCost.toLocaleString()}</td>
                    <td>${v.otherExpenses.toLocaleString()}</td>
                    <td className="font-bold text-white">${v.totalCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle ROI */}
      {activeReport === 'vehicle-roi' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Vehicle ROI Analysis</h3>
            <p className="text-xs text-gray-400 mt-1">ROI = (Revenue − Costs) / Acquisition Cost × 100%</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Vehicle</th><th>Acquisition</th><th>Revenue</th><th>Total Cost</th><th>Profit</th><th>ROI %</th></tr></thead>
              <tbody>
                {vehicleROI.map(v => (
                  <tr key={v.vehicleId}>
                    <td className="font-mono text-white">{v.registrationNumber}</td>
                    <td>${v.acquisitionCost.toLocaleString()}</td>
                    <td className="text-green">${v.revenue.toLocaleString()}</td>
                    <td className="text-amber">${v.totalCost.toLocaleString()}</td>
                    <td className={v.profit >= 0 ? 'text-green font-bold' : 'text-red font-bold'}>${v.profit.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${v.roi >= 0 ? 'badge-completed' : 'badge-cancelled'}`}>
                        {v.roi}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fleet Utilization */}
      {activeReport === 'fleet-utilization' && fleetUtil && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Current Fleet Status</h3>
            <div className="h-64">
              {utilChartData && <Doughnut data={utilChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { labels: { color: '#8b9dc0' } } } }} />}
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Utilization Summary</h3>
            <div className="space-y-4 mt-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Fleet Utilization</span>
                  <span className="text-white font-bold">{fleetUtil.utilization}%</span>
                </div>
                <div className="w-full h-3 bg-dark-500 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-cyan rounded-full transition-all" style={{ width: `${fleetUtil.utilization}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-dark-600/50">
                  <p className="text-2xl font-bold text-white">{fleetUtil.totalVehicles}</p>
                  <p className="text-xs text-gray-400">Total Vehicles</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-600/50">
                  <p className="text-2xl font-bold text-blue">{fleetUtil.onTrip}</p>
                  <p className="text-xs text-gray-400">On Trip</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-600/50">
                  <p className="text-2xl font-bold text-green">{fleetUtil.available}</p>
                  <p className="text-xs text-gray-400">Available</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-600/50">
                  <p className="text-2xl font-bold text-amber">{fleetUtil.inShop}</p>
                  <p className="text-xs text-gray-400">In Shop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
