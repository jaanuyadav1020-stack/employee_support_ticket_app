import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CommentSection } from './CommentSection';
import { ArrowLeft, Clock, Tag, User, ShieldAlert, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

export function TicketDetail({ ticketId, onBack, onStatusChanged }) {
  const { currentUser, isSupport } = useUser();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadTicket() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getTicketById(ticketId, currentUser?.id);
        if (isMounted) {
          setTicket(res.ticket);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load ticket details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (ticketId && currentUser) {
      loadTicket();
    }

    return () => { isMounted = false; };
  }, [ticketId, currentUser]);

  const handleStatusChange = async (newStatus) => {
    if (!ticket || newStatus === ticket.status || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      setStatusSuccess(false);
      const res = await api.updateTicketStatus(ticket.id, newStatus, currentUser?.id);
      setTicket(res.ticket);
      setStatusSuccess(true);
      if (onStatusChanged) onStatusChanged(res.ticket);

      setTimeout(() => setStatusSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="text-sm">Loading ticket details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-8 p-6 bg-white border border-rose-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 text-rose-600 mb-3">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="text-base font-bold">Access or Retrieval Error</h2>
        </div>
        <p className="text-xs text-slate-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ticket List</span>
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Ticket #{ticket.id}
        </span>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} size="lg" />
              <PriorityBadge priority={ticket.priority} />
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Tag className="w-3 h-3" />
                {ticket.category}
              </span>
            </div>

            {/* Status Change Control */}
            {isSupport ? (
              <div className="flex items-center gap-2 bg-purple-50/70 border border-purple-200 p-1.5 rounded-xl">
                <span className="text-[11px] font-semibold text-purple-900 pl-1">Update Status:</span>
                <select
                  value={ticket.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold bg-white border border-purple-200 text-purple-900 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-purple-500 outline-hidden cursor-pointer"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />}
                {statusSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                Status managed by Support Team
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {ticket.title}
          </h1>

          {/* Subtitle / Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Created by <strong className="text-slate-700">{ticket.creator_name}</strong> ({ticket.creator_email})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Opened on {new Date(ticket.created_at).toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div className="p-6 bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Problem Description
          </h2>
          <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            {ticket.description}
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6 border-t border-slate-100">
          <CommentSection ticketId={ticket.id} />
        </div>
      </div>
    </div>
  );
}
