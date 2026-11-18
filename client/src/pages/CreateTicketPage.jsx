import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle2, LifeBuoy } from 'lucide-react';

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Facilities', 'Access & Accounts', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export function CreateTicketPage({ onBack, onTicketCreated }) {
  const { currentUser } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const clientErrors = [];
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      clientErrors.push('Problem title is required and cannot be empty or whitespace only.');
    } else if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
      clientErrors.push('Problem title must be between 5 and 100 characters long.');
    }
    if (!description.trim() || description.trim().length < 10 || description.trim().length > 1000) {
      clientErrors.push('Detailed description must be between 10 and 1,000 characters long.');
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

      setSuccess(true);
      setTimeout(() => {
        onTicketCreated(res.ticket);
      }, 700);
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        setErrors(err.details);
      } else {
        setErrors([err.message || 'Failed to submit ticket. Please verify inputs.']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs text-slate-400">
          Submitting as <strong className="text-slate-700">{currentUser?.name}</strong>
        </span>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create a New Support Ticket</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please provide clear details about your issue so the support team can assist you efficiently.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please correct the following issues:</span>
              </div>
              <ul className="list-disc list-inside pl-1 space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Ticket submitted successfully! Redirecting...</span>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Problem Title *</label>
              <span className={`text-[11px] ${title.length > 100 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Cannot access office printer from 3rd floor workstation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-50/50 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 5 characters. Keep it brief and descriptive.
            </p>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white transition cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white transition cursor-pointer"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Detailed Description *</label>
              <span className={`text-[11px] ${description.length > 1000 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {description.length}/1000
              </span>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Provide context, exact error messages, hardware serials, or steps already attempted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-50/50 focus:bg-white transition resize-y"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 10 characters. Up to 1,000 characters.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
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
