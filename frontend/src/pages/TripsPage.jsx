import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { Plus, Play, CheckCircle, XCircle, Filter } from 'lucide-react';

export default function TripsPage() {
  const { user } = useAuth();
  const canManageTrips = ['fleet_manager', 'dispatcher'].includes(user?.role);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    source: '', destination: '', vehicle: '', driver: '',
    cargoWeight: '', plannedDistance: '',
  });
  const [completeForm, setCompleteForm] = useState({
    actualDistance: '', fuelConsumed: '', finalOdometer: '',
  });

  useEffect(() => { fetchTrips(); }, [filterStatus]);

  const fetchTrips = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/trips', { params });
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        api.get('/vehicles/available'),
        api.get('/drivers/available'),
      ]);
      setAvailableVehicles(vRes.data);
      setAvailableDrivers(dRes.data);
      setForm({ source: '', destination: '', vehicle: '', driver: '', cargoWeight: '', plannedDistance: '' });
      setModalOpen(true);
    } catch (err) {
      setToast({ message: 'Failed to load available resources', type: 'error' });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/trips', form);
      setToast({ message: 'Trip created as Draft', type: 'success' });
      setModalOpen(false);
      fetchTrips();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error creating trip', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (id) => {
    try {
      await api.patch(`/trips/${id}/dispatch`);
      setToast({ message: 'Trip dispatched! Vehicle & Driver are now On Trip', type: 'success' });
      fetchTrips();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Cannot dispatch', type: 'error' });
    }
  };

  const openComplete = (trip) => {
    setCompleteForm({
      actualDistance: trip.plannedDistance,
      fuelConsumed: '',
      finalOdometer: '',
    });
    setCompleteModal(trip);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/trips/${completeModal._id}/complete`, completeForm);
      setToast({ message: 'Trip completed! Vehicle & Driver restored to Available', type: 'success' });
      setCompleteModal(null);
      fetchTrips();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error completing trip', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this trip?')) return;
    try {
      await api.patch(`/trips/${id}/cancel`);
      setToast({ message: 'Trip cancelled', type: 'success' });
      fetchTrips();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error cancelling', type: 'error' });
    }
  };

  const selectedVehicle = availableVehicles.find(v => v._id === form.vehicle);

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Trip Management</h1>
          <p className="text-gray-400 text-sm mt-1">{trips.length} trips</p>
        </div>
        {canManageTrips && (
          <button onClick={openCreate} className="btn btn-primary"><Plus size={18} /> Create Trip</button>
        )}
      </div>

      <div className="glass-card p-4 mb-6 flex gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo (kg)</th>
                <th>Distance (km)</th>
                <th>Status</th>
                {canManageTrips && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {trips.map(t => (
                <tr key={t._id}>
                  <td className="font-medium text-white">{t.source} → {t.destination}</td>
                  <td>
                    <span className="font-mono text-xs">{t.vehicle?.registrationNumber}</span>
                    <br /><span className="text-xs text-gray-400">{t.vehicle?.name}</span>
                  </td>
                  <td>{t.driver?.name || '—'}</td>
                  <td>{t.cargoWeight}</td>
                  <td>{t.actualDistance || t.plannedDistance}</td>
                  <td><StatusBadge status={t.status} /></td>
                  {canManageTrips && (
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {t.status === 'Draft' && (
                          <button onClick={() => handleDispatch(t._id)} className="btn btn-sm btn-success cursor-pointer" title="Dispatch">
                            <Play size={14} /> Dispatch
                          </button>
                        )}
                        {t.status === 'Dispatched' && (
                          <>
                            <button onClick={() => openComplete(t)} className="btn btn-sm btn-primary cursor-pointer" title="Complete">
                              <CheckCircle size={14} /> Complete
                            </button>
                            <button onClick={() => handleCancel(t._id)} className="btn btn-sm btn-danger cursor-pointer" title="Cancel">
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {t.status === 'Draft' && (
                          <button onClick={() => handleCancel(t._id)} className="btn btn-sm btn-danger cursor-pointer" title="Cancel">
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {trips.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{loading ? 'Loading...' : 'No trips found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Trip Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Trip">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source *</label>
              <input type="text" value={form.source} onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))} className="input-field" required placeholder="City or location" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Destination *</label>
              <input type="text" value={form.destination} onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))} className="input-field" required placeholder="City or location" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle *</label>
            <select value={form.vehicle} onChange={(e) => setForm(f => ({ ...f, vehicle: e.target.value }))} className="input-field" required>
              <option value="">Select vehicle...</option>
              {availableVehicles.map(v => (
                <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name} (Max: {v.maxLoadCapacity}kg)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Driver *</label>
            <select value={form.driver} onChange={(e) => setForm(f => ({ ...f, driver: e.target.value }))} className="input-field" required>
              <option value="">Select driver...</option>
              {availableDrivers.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.licenseCategory}) — Score: {d.safetyScore}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Cargo Weight (kg) *</label>
              <input type="number" value={form.cargoWeight} onChange={(e) => setForm(f => ({ ...f, cargoWeight: Number(e.target.value) }))} className="input-field" required min="0" />
              {selectedVehicle && form.cargoWeight > selectedVehicle.maxLoadCapacity && (
                <p className="text-red text-xs mt-1">⚠ Exceeds vehicle capacity ({selectedVehicle.maxLoadCapacity} kg)</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Distance (km) *</label>
              <input type="number" value={form.plannedDistance} onChange={(e) => setForm(f => ({ ...f, plannedDistance: Number(e.target.value) }))} className="input-field" required min="0" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1 justify-center">
              {submitting && <span className="spinner" />} Create Trip
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip">
        {completeModal && (
          <form onSubmit={handleComplete} className="space-y-4">
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">{completeModal.source} → {completeModal.destination}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Actual Distance (km)</label>
              <input type="number" value={completeForm.actualDistance} onChange={(e) => setCompleteForm(f => ({ ...f, actualDistance: Number(e.target.value) }))} className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fuel Consumed (liters)</label>
              <input type="number" value={completeForm.fuelConsumed} onChange={(e) => setCompleteForm(f => ({ ...f, fuelConsumed: Number(e.target.value) }))} className="input-field" min="0" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Final Odometer (km)</label>
              <input type="number" value={completeForm.finalOdometer} onChange={(e) => setCompleteForm(f => ({ ...f, finalOdometer: Number(e.target.value) }))} className="input-field" min="0" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn btn-success flex-1 justify-center">
                {submitting && <span className="spinner" />} Complete Trip
              </button>
              <button type="button" onClick={() => setCompleteModal(null)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
