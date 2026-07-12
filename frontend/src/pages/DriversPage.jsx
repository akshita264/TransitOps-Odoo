import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'CE', 'DE'];
const STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const emptyForm = {
  name: '', licenseNumber: '', licenseCategory: 'B', licenseExpiry: '',
  contact: '', safetyScore: 100, status: 'Available',
};

export default function DriversPage() {
  const { user } = useAuth();
  const canManageDrivers = ['fleet_manager', 'safety_officer', 'dispatcher'].includes(user?.role);
  const canDeleteDrivers = ['fleet_manager', 'safety_officer'].includes(user?.role);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchDrivers(); }, [search, filterStatus]);

  const fetchDrivers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/drivers', { params });
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (d) => {
    setForm({
      name: d.name, licenseNumber: d.licenseNumber, licenseCategory: d.licenseCategory,
      licenseExpiry: d.licenseExpiry?.split('T')[0] || '',
      contact: d.contact, safetyScore: d.safetyScore, status: d.status,
    });
    setEditingId(d._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/drivers/${editingId}`, form);
        setToast({ message: 'Driver updated', type: 'success' });
      } else {
        await api.post('/drivers', form);
        setToast({ message: 'Driver created', type: 'success' });
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error saving driver', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      setToast({ message: 'Driver deleted', type: 'success' });
      fetchDrivers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Cannot delete', type: 'error' });
    }
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const expiry = new Date(date);
    const daysLeft = (expiry - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 30 && daysLeft > 0;
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Driver Management</h1>
          <p className="text-gray-400 text-sm mt-1">{drivers.length} drivers</p>
        </div>
        {canManageDrivers && (
          <button onClick={openCreate} className="btn btn-primary"><Plus size={18} /> Add Driver</button>
        )}
      </div>

      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or license..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>License</th>
                <th>Category</th>
                <th>License Expiry</th>
                <th>Contact</th>
                <th>Safety Score</th>
                <th>Status</th>
                {canManageDrivers && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d._id}>
                  <td className="font-semibold text-white">{d.name}</td>
                  <td className="font-mono">{d.licenseNumber}</td>
                  <td>{d.licenseCategory}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {isExpired(d.licenseExpiry) && <AlertTriangle size={14} className="text-red" />}
                      {isExpiringSoon(d.licenseExpiry) && <AlertTriangle size={14} className="text-amber" />}
                      <span className={isExpired(d.licenseExpiry) ? 'text-red' : isExpiringSoon(d.licenseExpiry) ? 'text-amber' : ''}>
                        {new Date(d.licenseExpiry).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>{d.contact}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-dark-500 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.safetyScore >= 80 ? 'bg-green' : d.safetyScore >= 60 ? 'bg-amber' : 'bg-red'}`}
                          style={{ width: `${d.safetyScore}%` }}
                        />
                      </div>
                      <span className="text-xs">{d.safetyScore}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                  {canManageDrivers && (
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(d)} className="btn-icon cursor-pointer"><Edit2 size={14} /></button>
                        {canDeleteDrivers && (
                          <button onClick={() => handleDelete(d._id)} className="btn-icon cursor-pointer hover:text-red hover:border-red/30"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">{loading ? 'Loading...' : 'No drivers found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">License Number *</label>
              <input type="text" value={form.licenseNumber} onChange={(e) => setForm(f => ({ ...f, licenseNumber: e.target.value }))} className="input-field" required disabled={!!editingId} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
              <select value={form.licenseCategory} onChange={(e) => setForm(f => ({ ...f, licenseCategory: e.target.value }))} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date *</label>
              <input type="date" value={form.licenseExpiry} onChange={(e) => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} className="input-field" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contact *</label>
              <input type="text" value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Safety Score</label>
              <input type="number" value={form.safetyScore} onChange={(e) => setForm(f => ({ ...f, safetyScore: Number(e.target.value) }))} className="input-field" min="0" max="100" />
            </div>
          </div>
          {editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1 justify-center">
              {submitting && <span className="spinner" />}
              {editingId ? 'Update' : 'Create'} Driver
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
