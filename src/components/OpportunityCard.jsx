import { useAuth } from '../context/AuthContext';

const STAGE_STYLES = {
  New: 'bg-ink-100 text-ink-700',
  Contacted: 'bg-blue-50 text-blue-700',
  Qualified: 'bg-violet-50 text-violet-700',
  'Proposal Sent': 'bg-amber-50 text-amber-700',
  Won: 'bg-emerald-50 text-emerald-700',
  Lost: 'bg-red-50 text-red-700',
};

const PRIORITY_STYLES = {
  Low: 'text-ink-500',
  Medium: 'text-amber-600',
  High: 'text-red-600',
};

function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OpportunityCard({ opportunity, onEdit, onDelete }) {
  const { user } = useAuth();
  const isOwner = opportunity.owner?._id === user?.id || opportunity.owner === user?.id;

  const isOverdue =
    opportunity.nextFollowUpDate &&
    new Date(opportunity.nextFollowUpDate) < new Date() &&
    !['Won', 'Lost'].includes(opportunity.stage);

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900 leading-tight">
            {opportunity.customerName}
          </h3>
          {opportunity.contactName && (
            <p className="text-sm text-ink-500">{opportunity.contactName}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STAGE_STYLES[opportunity.stage] || 'bg-ink-100 text-ink-700'}`}>
          {opportunity.stage}
        </span>
      </div>

      <p className="text-sm text-ink-700 line-clamp-2">{opportunity.requirement}</p>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-ink-300 block text-xs uppercase tracking-wide">Value</span>
          <span className="font-medium text-ink-900">{formatCurrency(opportunity.estimatedValue)}</span>
        </div>
        <div>
          <span className="text-ink-300 block text-xs uppercase tracking-wide">Priority</span>
          <span className={`font-medium ${PRIORITY_STYLES[opportunity.priority] || 'text-ink-700'}`}>
            {opportunity.priority}
          </span>
        </div>
        <div>
          <span className="text-ink-300 block text-xs uppercase tracking-wide">Follow-up</span>
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-ink-900'}`}>
            {formatDate(opportunity.nextFollowUpDate)}
            {isOverdue && ' (overdue)'}
          </span>
        </div>
        <div>
          <span className="text-ink-300 block text-xs uppercase tracking-wide">Owner</span>
          <span className="font-medium text-ink-900">
            {opportunity.owner?.name || 'Unknown'}
            {isOwner && <span className="text-brand"> (you)</span>}
          </span>
        </div>
      </div>

      {opportunity.notes && (
        <p className="text-xs text-ink-500 italic border-t border-ink-100 pt-2 line-clamp-2">
          {opportunity.notes}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-ink-100 pt-3 mt-auto">
        <span className="text-xs text-ink-300">Added {formatDate(opportunity.createdAt)}</span>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(opportunity)} className="btn-secondary text-xs px-3 py-1.5">
              Edit
            </button>
            <button onClick={() => onDelete(opportunity)} className="btn-danger text-xs px-3 py-1.5">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
