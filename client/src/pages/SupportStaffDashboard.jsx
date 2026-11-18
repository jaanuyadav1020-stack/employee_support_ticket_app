import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  Shield, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Inbox, 
  ArrowRight,
  MessageSquare,
  User
} from 'lucide-react';

const CATEGORIES = ['All Categories', 'Hardware', 'Software', 'Network', 'Facilities', 'Access & Accounts', 'Other'];
const PRIORITIES = ['All Priorities', 'Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

export function SupportStaffDashboard({ tickets, onSelectTicket, loading }) {
  const { currentUser } = useUser();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [search, setSearch] = useState('');

  // Queue KPI counts
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;

  const filteredTickets = tickets.filter(ticket => {
    if (selectedStatus !== 'All' && ticket.status !== selectedStatus) return false;
    if (selectedCategory !== 'All Categories' && ticket.category !== selectedCategory) return false;
    if (selectedPriority !== 'All Priorities' && ticket.priority !== selectedPriority) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchDesc = ticket.description.toLowerCase().includes(q);
      const matchCreator = ticket.creator_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCreator) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Support Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Support Staff Triage Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            Global Workplace Support Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Logged in as <strong className="text-white">{currentUser?.name}</strong>. Monitor incoming tickets across all company departments, assign statuses, and resolve problems.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Tickets</span>
            <Inbox className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Awaiting Action</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{openCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>In Triage</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{inProgressCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>High & Urgent</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{urgentCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium px-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {STATUSES.map(status => {
            const isSelected = selectedStatus === status;
            const count = status === 'All'
              ? tickets.length
              : tickets.filter(t => t.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{status}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category/Priority Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden bg-slate-50 focus:bg-white transition"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden bg-white text-slate-700 font-medium cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden bg-white text-slate-700 font-medium cursor-pointer"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ticket Queue List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Loading support queue...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Queue is clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tickets match your active filters.
            </p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="group bg-white hover:bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {ticket.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Reported by <strong>{ticket.creator_name}</strong></span>
                  </span>
                  <span>
                    {new Date(ticket.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <MessageSquare className="w-3 h-3 text-purple-500" />
                    <span>{ticket.comment_count || 0} comments</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Ticket</span>
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
