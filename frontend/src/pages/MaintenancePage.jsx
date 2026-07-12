import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { Plus, CheckCircle } from 'lucide-react';

const TYPES = ['Oil Change', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'Transmission', 'Electrical', 'Body Work', 'General Service', 'Other'];

export default function MaintenancePage() {
  const { user } = useAuth();
  const canManageMaintenance = ['fleet_manager', 'dispatcher'].includes(user?.role);
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ vehicle: '', description: '', type: 'General Service', cost: '' });

  useEffect(() => { fetchLogs(); }, [filterStatus]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/maintenance', { params });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.filter(v => v.status !== 'On Trip'));
      setForm({ vehicle: '', description: '', type: 'General Service', cost: '' });
      setModalOpen(true);
    } catch (err) {
      setToast({ message: 'Failed to load vehicles', type: 'error' });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/maintenance', form);
      setToast({ message: 'Maintenance record created — Vehicle is now In Shop', type: 'success' });
      setModalOpen(false);
      fetchLogs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    try {
      await api.patch(`/maintenance/${id}/close`);
      setToast({ message: 'Maintenance closed — Vehicle restored to Available', type: 'success' });
      fetchLogs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error closing', type: 'error' });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance</h1>
          <p className="text-gray-400 text-sm mt-1">{logs.length} records</p>
        </div>
        {canManageMaintenance && (
          <button onClick={openCreate} className="btn btn-primary"><Plus size={18} /> New Record</button>
        )}
      </div>

      <div className="glass-card p-4 mb-6 flex gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto">
          <option value="">All</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Description</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Date</th>
                {canManageMaintenance && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id}>
                  <td>
                    <span className="font-mono text-xs text-white">{l.vehicle?.registrationNumber}</span>
                    <br /><span className="text-xs text-gray-400">{l.vehicle?.name}</span>
                  </td>
                  <td>{l.type}</td>
                  <td className="max-w-xs truncate">{l.description}</td>
                  <td className="font-semibold">${l.cost?.toLocaleString()}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td className="text-xs text-gray-400">
                    {new Date(l.createdAt).toLocaleDateString()}
                    {l.closedAt && <><br />Closed: {new Date(l.closedAt).toLocaleDateString()}</>}
                  </td>
                  {canManageMaintenance && (
                    <td>
                      {l.status === 'Open' && (
                        <button onClick={() => handleClose(l._id)} className="btn btn-sm btn-success cursor-pointer">
                          <CheckCircle size={14} /> Close
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{loading ? 'Loading...' : 'No maintenance records'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Maintenance Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle *</label>
            <select value={form.vehicle} onChange={(e) => setForm(f => ({ ...f, vehicle: e.target.value }))} className="input-field" required>
              <option value="">Select vehicle...</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name} ({v.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
            <input type="text" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" required placeholder="Describe the maintenance work" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Cost *</label>
            <input type="number" value={form.cost} onChange={(e) => setForm(f => ({ ...f, cost: Number(e.target.value) }))} className="input-field" required min="0" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1 justify-center">
              {submitting && <span className="spinner" />} Create Record
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
