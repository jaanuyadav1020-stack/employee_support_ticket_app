import React from 'react';

const STATUS_STYLES = {
  'Open': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
  'Closed': 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20'
};

const DOT_COLORS = {
  'Open': 'bg-blue-500',
  'In Progress': 'bg-amber-500 animate-pulse',
  'Resolved': 'bg-emerald-500',
  'Closed': 'bg-slate-400'
};

export function StatusBadge({ status, size = 'sm' }) {
  const badgeStyle = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const dotColor = DOT_COLORS[status] || 'bg-gray-400';

  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${sizeClass} ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
