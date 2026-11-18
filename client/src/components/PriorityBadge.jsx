import React from 'react';

const PRIORITY_STYLES = {
  'Urgent': 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
  'High': 'bg-orange-100 text-orange-800 border-orange-200 font-medium',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200 font-medium',
  'Low': 'bg-slate-100 text-slate-700 border-slate-200 font-normal'
};

export function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style}`}>
      {priority}
    </span>
  );
}
