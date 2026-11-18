import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { X, AlertCircle, Loader2, Send } from 'lucide-react';

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Facilities', 'Access & Accounts', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export function TicketForm({ isOpen, onClose, onTicketCreated }) {
  const { currentUser } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const clientErrors = [];
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      clientErrors.push('Title is required and cannot be empty or whitespace only.');
    } else if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
      clientErrors.push('Title must be between 5 and 100 characters long.');
    }
    if (!description.trim() || description.trim().length < 10 || description.trim().length > 1000) {
      clientErrors.push('Description must be between 10 and 1000 characters long.');
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createTicket(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          priority
        },
        currentUser?.id
      );

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Hardware');
      setPriority('Medium');
      onTicketCreated(res.ticket);
      onClose();
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        setErrors(err.details);
      } else {
        setErrors([err.message || 'Failed to submit ticket. Please check input.']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit Workplace Support Ticket</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitting as <span className="font-semibold text-slate-700">{currentUser?.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please correct the following:</span>
              </div>
              <ul className="list-disc list-inside pl-1 space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Problem Title *</label>
              <span className={`text-[10px] ${title.length > 100 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Cannot connect to office Wi-Fi in building B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white transition"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white transition"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Detailed Description *</label>
              <span className={`text-[10px] ${description.length > 1000 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {description.length}/1000
              </span>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Describe what happened, any error messages shown, and steps you already tried..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
