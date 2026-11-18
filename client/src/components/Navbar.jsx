import React from 'react';
import { useUser } from '../context/UserContext';
import { UserSwitcher } from './UserSwitcher';
import { LifeBuoy, PlusCircle, LayoutList } from 'lucide-react';

export function Navbar({ activeView, setActiveView, onOpenCreateModal }) {
  const { isEmployee } = useUser();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                SupportHub
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Employee Issue & Ticket Tracker
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            {/* View Switching */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeView === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Tickets</span>
              </button>
            </div>

            {/* Create Ticket Button (Employee only or for all) */}
            {isEmployee && (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Ticket</span>
              </button>
            )}

            {/* Persona Switcher */}
            <UserSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
