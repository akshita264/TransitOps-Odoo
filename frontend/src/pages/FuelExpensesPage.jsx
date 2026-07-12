import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Toast from '../components/Toast';
import { Plus, Fuel, DollarSign } from 'lucide-react';

export default function FuelExpensesPage() {
  const { user } = useAuth();
  const canAddExpenses = ['fleet_manager', 'financial_analyst', 'dispatcher'].includes(user?.role);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('fuel');
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fuelForm, setFuelForm] = useState({ vehicle: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState({ vehicle: '', category: 'Toll', description: '', amount: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [f, e, v] = await Promise.all([
        api.get('/fuel'),
        api.get('/expenses'),
        api.get('/vehicles'),
      ]);
      setFuelLogs(f.data);
      setExpenses(e.data);
      setVehicles(v.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/fuel', fuelForm);
      setToast({ message: 'Fuel log added', type: 'success' });
      setShowFuelForm(false);
      setFuelForm({ vehicle: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
      fetchAll();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/expenses', expenseForm);
      setToast({ message: 'Expense added', type: 'success' });
      setShowExpenseForm(false);
      setExpenseForm({ vehicle: '', category: 'Toll', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      fetchAll();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Fuel & Expenses</h1>
          <p className="text-gray-400 text-sm mt-1">Track operational costs</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
              <Fuel size={20} className="text-cyan" />
            </div>
            <p className="text-xs text-gray-400">Total Fuel Cost</p>
          </div>
          <p className="text-2xl font-bold text-white">${totalFuelCost.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center">
              <DollarSign size={20} className="text-amber" />
            </div>
            <p className="text-xs text-gray-400">Total Other Expenses</p>
          </div>
          <p className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center">
              <DollarSign size={20} className="text-red" />
            </div>
            <p className="text-xs text-gray-400">Grand Total</p>
          </div>
          <p className="text-2xl font-bold text-white">${(totalFuelCost + totalExpenses).toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('fuel')} className={`btn btn-sm ${tab === 'fuel' ? 'btn-primary' : 'btn-secondary'} cursor-pointer`}>
          Fuel Logs ({fuelLogs.length})
        </button>
        <button onClick={() => setTab('expenses')} className={`btn btn-sm ${tab === 'expenses' ? 'btn-primary' : 'btn-secondary'} cursor-pointer`}>
          Expenses ({expenses.length})
        </button>
      </div>

      {/* Fuel Tab */}
      {tab === 'fuel' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Fuel Logs</h3>
            {canAddExpenses && (
              <button onClick={() => setShowFuelForm(!showFuelForm)} className="btn btn-sm btn-primary cursor-pointer">
                <Plus size={14} /> Add Fuel Log
              </button>
            )}
          </div>
          {showFuelForm && (
            <form onSubmit={handleAddFuel} className="p-4 border-b border-white/[0.06] bg-dark-700/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={fuelForm.vehicle} onChange={(e) => setFuelForm(f => ({ ...f, vehicle: e.target.value }))} className="input-field" required>
                  <option value="">Vehicle...</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                </select>
                <input type="number" placeholder="Liters" value={fuelForm.liters} onChange={(e) => setFuelForm(f => ({ ...f, liters: Number(e.target.value) }))} className="input-field" required min="0" step="0.1" />
                <input type="number" placeholder="Cost ($)" value={fuelForm.cost} onChange={(e) => setFuelForm(f => ({ ...f, cost: Number(e.target.value) }))} className="input-field" required min="0" />
                <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" disabled={submitting} className="btn btn-sm btn-success cursor-pointer">{submitting ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowFuelForm(false)} className="btn btn-sm btn-secondary cursor-pointer">Cancel</button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Vehicle</th><th>Liters</th><th>Cost</th><th>Trip</th><th>Date</th></tr></thead>
              <tbody>
                {fuelLogs.map(f => (
                  <tr key={f._id}>
                    <td className="font-mono text-xs">{f.vehicle?.registrationNumber || '—'}</td>
                    <td>{f.liters} L</td>
                    <td className="font-semibold">${f.cost?.toLocaleString()}</td>
                    <td className="text-xs text-gray-400">{f.trip ? `${f.trip.source} → ${f.trip.destination}` : '—'}</td>
                    <td className="text-xs">{new Date(f.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {fuelLogs.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No fuel logs</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Expenses</h3>
            {canAddExpenses && (
              <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="btn btn-sm btn-primary cursor-pointer">
                <Plus size={14} /> Add Expense
              </button>
            )}
          </div>
          {showExpenseForm && (
            <form onSubmit={handleAddExpense} className="p-4 border-b border-white/[0.06] bg-dark-700/50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <select value={expenseForm.vehicle} onChange={(e) => setExpenseForm(f => ({ ...f, vehicle: e.target.value }))} className="input-field" required>
                  <option value="">Vehicle...</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                </select>
                <select value={expenseForm.category} onChange={(e) => setExpenseForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  <option value="Toll">Toll</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Parking">Parking</option>
                  <option value="Fine">Fine</option>
                  <option value="Other">Other</option>
                </select>
                <input type="text" placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm(f => ({ ...f, description: e.target.value }))} className="input-field" />
                <input type="number" placeholder="Amount ($)" value={expenseForm.amount} onChange={(e) => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))} className="input-field" required min="0" />
                <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" disabled={submitting} className="btn btn-sm btn-success cursor-pointer">{submitting ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowExpenseForm(false)} className="btn btn-sm btn-secondary cursor-pointer">Cancel</button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Vehicle</th><th>Category</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e._id}>
                    <td className="font-mono text-xs">{e.vehicle?.registrationNumber || '—'}</td>
                    <td><span className="badge badge-draft">{e.category}</span></td>
                    <td>{e.description || '—'}</td>
                    <td className="font-semibold">${e.amount?.toLocaleString()}</td>
                    <td className="text-xs">{new Date(e.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No expenses</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
