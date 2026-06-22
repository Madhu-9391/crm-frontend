import { useState, useEffect } from 'react';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const EMPTY_FORM = {
  customerName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  requirement: '',
  estimatedValue: '',
  stage: 'New',
  priority: 'Medium',
  nextFollowUpDate: '',
  notes: '',
};

function toDateInputValue(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function OpportunityForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setForm({
        customerName: initialData.customerName || '',
        contactName: initialData.contactName || '',
        contactEmail: initialData.contactEmail || '',
        contactPhone: initialData.contactPhone || '',
        requirement: initialData.requirement || '',
        estimatedValue: initialData.estimatedValue ?? '',
        stage: initialData.stage || 'New',
        priority: initialData.priority || 'Medium',
        nextFollowUpDate: toDateInputValue(initialData.nextFollowUpDate),
        notes: initialData.notes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Customer / company name is required';
    if (!form.requirement.trim()) newErrors.requirement = 'Requirement summary is required';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Enter a valid email address';
    }
    if (form.estimatedValue !== '' && Number(form.estimatedValue) < 0) {
      newErrors.estimatedValue = 'Value cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      estimatedValue: form.estimatedValue === '' ? 0 : Number(form.estimatedValue),
      nextFollowUpDate: form.nextFollowUpDate || null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text" htmlFor="customerName">
            Customer / company name *
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            className="input-field"
            value={form.customerName}
            onChange={handleChange}
            placeholder="Acme Industries"
          />
          {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="contactName">
            Contact person
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            className="input-field"
            value={form.contactName}
            onChange={handleChange}
            placeholder="Jordan Lee"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="contactEmail">
            Contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            className="input-field"
            value={form.contactEmail}
            onChange={handleChange}
            placeholder="jordan@acme.com"
          />
          {errors.contactEmail && <p className="text-xs text-red-600 mt-1">{errors.contactEmail}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="contactPhone">
            Contact phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            className="input-field"
            value={form.contactPhone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div>
        <label className="label-text" htmlFor="requirement">
          Requirement / need summary *
        </label>
        <textarea
          id="requirement"
          name="requirement"
          rows={3}
          className="input-field"
          value={form.requirement}
          onChange={handleChange}
          placeholder="Looking for a 200-seat CRM rollout with SSO..."
        />
        {errors.requirement && <p className="text-xs text-red-600 mt-1">{errors.requirement}</p>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="label-text" htmlFor="estimatedValue">
            Estimated value (₹)
          </label>
          <input
            id="estimatedValue"
            name="estimatedValue"
            type="number"
            min="0"
            step="1000"
            className="input-field"
            value={form.estimatedValue}
            onChange={handleChange}
            placeholder="500000"
          />
          {errors.estimatedValue && <p className="text-xs text-red-600 mt-1">{errors.estimatedValue}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="stage">
            Stage
          </label>
          <select id="stage" name="stage" className="input-field" value={form.stage} onChange={handleChange}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-text" htmlFor="priority">
            Priority
          </label>
          <select id="priority" name="priority" className="input-field" value={form.priority} onChange={handleChange}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-text" htmlFor="nextFollowUpDate">
            Next follow-up
          </label>
          <input
            id="nextFollowUpDate"
            name="nextFollowUpDate"
            type="date"
            className="input-field"
            value={form.nextFollowUpDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="label-text" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="input-field"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any internal context, history, or next steps..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create opportunity'}
        </button>
      </div>
    </form>
  );
}
