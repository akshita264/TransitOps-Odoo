export default function StatusBadge({ status }) {
  const statusMap = {
    'Available': 'badge-available',
    'On Trip': 'badge-on-trip',
    'In Shop': 'badge-in-shop',
    'Retired': 'badge-retired',
    'Suspended': 'badge-suspended',
    'Off Duty': 'badge-off-duty',
    'Draft': 'badge-draft',
    'Dispatched': 'badge-dispatched',
    'Completed': 'badge-completed',
    'Cancelled': 'badge-cancelled',
    'Open': 'badge-open',
    'Closed': 'badge-closed',
  };

  const dotColors = {
    'Available': 'bg-green-400',
    'On Trip': 'bg-blue-400',
    'In Shop': 'bg-amber-400',
    'Retired': 'bg-gray-400',
    'Suspended': 'bg-red-400',
    'Off Duty': 'bg-purple-400',
    'Draft': 'bg-gray-300',
    'Dispatched': 'bg-blue-400',
    'Completed': 'bg-green-400',
    'Cancelled': 'bg-red-400',
    'Open': 'bg-amber-400',
    'Closed': 'bg-green-400',
  };

  return (
    <span className={`badge border border-white/[0.08] shadow-sm ${statusMap[status] || 'badge-draft'}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${dotColors[status] || 'bg-gray-400'}`} style={{ boxShadow: '0 0 6px currentColor' }} />
      {status}
    </span>
  );
}
