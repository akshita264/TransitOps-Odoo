import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const TYPES = ['Van', 'Truck', 'Bus', 'Car', 'Motorcycle'];
const STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];

const emptyForm = {
  registrationNumber: '', name: '', type: 'Van', maxLoadCapacity: '',
  odometer: 0, acquisitionCost: '', status: 'Available', region: 'Default',
};

export default function VehiclesPage() {
  const { user } = useAuth();
  const canManageVehicles = ['fleet_manager', 'dispatcher'].includes(user?.role);
  const canDeleteVehicles = ['fleet_manager'].includes(user?.role);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchVehicles(); }, [search, filterType, filterStatus]);

  const fetchVehicles = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/vehicles', { params });
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setForm({
      registrationNumber: v.registrationNumber,
      name: v.name,
      type: v.type,
      maxLoadCapacity: v.maxLoadCapacity,
      odometer: v.odometer,
      acquisitionCost: v.acquisitionCost,
      status: v.status,
      region: v.region || 'Default',
    });
    setEditingId(v._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, form);
        setToast({ message: 'Vehicle updated successfully', type: 'success' });
      } else {
        await api.post('/vehicles', form);
        setToast({ message: 'Vehicle created successfully', type: 'success' });
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error saving vehicle', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setToast({ message: 'Vehicle deleted', type: 'success' });
      fetchVehicles();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Cannot delete vehicle', type: 'error' });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicle Registry</h1>
          <p className="text-gray-400 text-sm mt-1">{vehicles.length} vehicles</p>
        </div>
        {canManageVehicles && (
          <button onClick={openCreate} className="btn btn-primary">
            <Plus size={18} /> Add Vehicle
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by registration or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-auto">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity (kg)</th>
                <th>Odometer</th>
                <th>Cost</th>
                <th>Region</th>
                <th>Status</th>
                {canManageVehicles && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v._id}>
                  <td className="font-mono font-semibold text-white">{v.registrationNumber}</td>
                  <td>{v.name}</td>
                  <td>{v.type}</td>
                  <td>{v.maxLoadCapacity.toLocaleString()}</td>
                  <td>{v.odometer.toLocaleString()} km</td>
                  <td>${v.acquisitionCost.toLocaleString()}</td>
                  <td>{v.region}</td>
                  <td><StatusBadge status={v.status} /></td>
                  {canManageVehicles && (
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(v)} className="btn-icon cursor-pointer" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        {canDeleteVehicles && (
                          <button onClick={() => handleDelete(v._id)} className="btn-icon cursor-pointer hover:text-red hover:border-red/30" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    {loading ? 'Loading...' : 'No vehicles found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Registration Number *</label>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(e) => setForm(f => ({ ...f, registrationNumber: e.target.value }))}
                className="input-field"
                required
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Max Load (kg) *</label>
              <input
                type="number"
                value={form.maxLoadCapacity}
                onChange={(e) => setForm(f => ({ ...f, maxLoadCapacity: Number(e.target.value) }))}
                className="input-field"
                required
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Odometer (km)</label>
              <input
                type="number"
                value={form.odometer}
                onChange={(e) => setForm(f => ({ ...f, odometer: Number(e.target.value) }))}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Acquisition Cost *</label>
              <input
                type="number"
                value={form.acquisitionCost}
                onChange={(e) => setForm(f => ({ ...f, acquisitionCost: Number(e.target.value) }))}
                className="input-field"
                required
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Region</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm(f => ({ ...f, region: e.target.value }))}
                className="input-field"
              />
            </div>
            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1 justify-center">
              {submitting && <span className="spinner" />}
              {editingId ? 'Update' : 'Create'} Vehicle
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
