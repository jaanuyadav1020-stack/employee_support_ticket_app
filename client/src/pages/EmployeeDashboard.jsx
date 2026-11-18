import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Inbox, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

export function EmployeeDashboard({ tickets, onSelectTicket, onNavigateCreate, loading }) {
  const { currentUser } = useUser();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Stats calculation
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'All' && ticket.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchDesc = ticket.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
            Employee Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            Report workplace problems, monitor live ticket progress, and communicate directly with the support team.
          </p>
        </div>
        <button
          onClick={onNavigateCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Ticket</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Submitted</span>
            <Inbox className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Open & Pending</span>
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{openCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{inProgressCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Resolved Issues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{resolvedCount}</p>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {STATUS_FILTERS.map(status => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search my tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Loading your tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No tickets found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== 'All'
                  ? 'No tickets match the selected search or filter.'
                  : 'You have not submitted any workplace tickets yet.'}
              </p>
            </div>
            <button
              onClick={onNavigateCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Ticket</span>
            </button>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="group bg-white hover:bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{ticket.id}
                  </span>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {ticket.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>
                    Reported on {new Date(ticket.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <MessageSquare className="w-3 h-3 text-indigo-500" />
                    <span>{ticket.comment_count || 0} comments</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
