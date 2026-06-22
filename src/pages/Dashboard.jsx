import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchOpportunities,
  createOpportunity as apiCreateOpportunity,
  updateOpportunity as apiUpdateOpportunity,
  deleteOpportunity as apiDeleteOpportunity,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityForm from '../components/OpportunityForm';
import Modal from '../components/Modal';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (stageFilter) params.stage = stageFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const { data } = await fetchOpportunities(params);
      setOpportunities(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [stageFilter, priorityFilter, search]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setEditingOpportunity(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleEdit = (opportunity) => {
    setEditingOpportunity(opportunity);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingOpportunity) {
        await apiUpdateOpportunity(editingOpportunity._id, payload);
        showToast('Opportunity updated');
      } else {
        await apiCreateOpportunity(payload);
        showToast('Opportunity created');
      }
      setIsFormOpen(false);
      setEditingOpportunity(null);
      await loadOpportunities();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setFormError(apiErrors ? apiErrors.join(' ') : err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingOpportunity) return;
    setIsSubmitting(true);
    try {
      await apiDeleteOpportunity(deletingOpportunity._id);
      showToast('Opportunity deleted');
      setDeletingOpportunity(null);
      await loadOpportunities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete opportunity.');
      setDeletingOpportunity(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const totalValue = opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const wonValue = opportunities
      .filter((o) => o.stage === 'Won')
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const highPriorityCount = opportunities.filter(
      (o) => o.priority === 'High' && !['Won', 'Lost'].includes(o.stage)
    ).length;
    return { totalValue, wonValue, highPriorityCount, total: opportunities.length };
  }, [opportunities]);

  const clearFilters = () => {
    setStageFilter('');
    setPriorityFilter('');
    setSearch('');
  };

  const hasActiveFilters = stageFilter || priorityFilter || search;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Opportunity pipeline</h1>
          <p className="text-sm text-ink-500">Shared across your whole team. {user?.name && `Welcome, ${user.name}.`}</p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          + New opportunity
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-300">Total pipeline</p>
          <p className="font-display text-xl font-semibold text-ink-900 mt-1">{formatCurrency(summary.totalValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-300">Won value</p>
          <p className="font-display text-xl font-semibold text-emerald-700 mt-1">{formatCurrency(summary.wonValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-300">High priority open</p>
          <p className="font-display text-xl font-semibold text-red-600 mt-1">{summary.highPriorityCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-300">Total opportunities</p>
          <p className="font-display text-xl font-semibold text-ink-900 mt-1">{summary.total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="label-text" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            type="text"
            className="input-field"
            placeholder="Customer, contact, or requirement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[150px]">
          <label className="label-text" htmlFor="stageFilter">
            Stage
          </label>
          <select
            id="stageFilter"
            className="input-field"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[150px]">
          <label className="label-text" htmlFor="priorityFilter">
            Priority
          </label>
          <select
            id="priorityFilter"
            className="input-field"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-secondary">
            Clear filters
          </button>
        )}
      </div>

      {/* Content states */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 h-48 animate-pulse bg-ink-100/50" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-display text-lg font-semibold text-ink-700 mb-1">
            {hasActiveFilters ? 'No opportunities match your filters' : 'No opportunities yet'}
          </p>
          <p className="text-sm text-ink-500 mb-4">
            {hasActiveFilters
              ? 'Try adjusting or clearing your filters.'
              : 'Create the first opportunity to start the pipeline.'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="btn-secondary">
              Clear filters
            </button>
          ) : (
            <button onClick={handleCreate} className="btn-primary">
              + New opportunity
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp._id}
              opportunity={opp}
              onEdit={handleEdit}
              onDelete={setDeletingOpportunity}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {isFormOpen && (
        <Modal
          title={editingOpportunity ? 'Edit opportunity' : 'New opportunity'}
          onClose={() => setIsFormOpen(false)}
        >
          {formError && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
          <OpportunityForm
            initialData={editingOpportunity}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deletingOpportunity && (
        <Modal title="Delete opportunity" onClose={() => setDeletingOpportunity(null)}>
          <p className="text-sm text-ink-700 mb-6">
            Are you sure you want to delete the opportunity for{' '}
            <span className="font-semibold">{deletingOpportunity.customerName}</span>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeletingOpportunity(null)} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button onClick={confirmDelete} className="btn-danger" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-ink-900 text-white text-sm px-4 py-2.5 rounded-md shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
