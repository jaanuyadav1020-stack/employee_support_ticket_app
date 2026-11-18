import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  PlusCircle, 
  Inbox, 
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = ['All Categories', 'Hardware', 'Software', 'Network', 'Facilities', 'Access & Accounts', 'Other'];
const PRIORITIES = ['All Priorities', 'Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

export function TicketList({ tickets, onSelectTicket, onOpenCreateModal, loading }) {
  const { isEmployee, isSupport, currentUser } = useUser();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');

  const filteredTickets = tickets.filter(ticket => {
    // Status filter
    if (selectedStatus !== 'All' && ticket.status !== selectedStatus) return false;

    // Category filter
    if (selectedCategory !== 'All Categories' && ticket.category !== selectedCategory) return false;

    // Priority filter
    if (selectedPriority !== 'All Priorities' && ticket.priority !== selectedPriority) return false;

    // Search query
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
      {/* Top Banner / Role Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isSupport ? 'Support Queue (All Tickets)' : 'My Support Tickets'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSupport
              ? `Logged in as Support Agent ${currentUser?.name}. Viewing tickets from all employees.`
              : `Logged in as ${currentUser?.name}. Showing issues you have reported.`}
          </p>
        </div>

        {isEmployee && (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Ticket</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
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
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{status}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, description, or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden bg-white text-slate-700 font-medium"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden bg-white text-slate-700 font-medium"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No tickets found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search || selectedStatus !== 'All' || selectedCategory !== 'All Categories' || selectedPriority !== 'All Priorities'
                  ? 'No tickets match the selected filters. Try resetting your search or filters.'
                  : isEmployee
                  ? 'You have not submitted any workplace tickets yet. Click below to submit your first ticket.'
                  : 'There are no support tickets in the queue.'}
              </p>
            </div>
            {isEmployee && (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit a Ticket</span>
              </button>
            )}
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="group bg-white hover:bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
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

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{ticket.creator_name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
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
