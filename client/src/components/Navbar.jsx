import React from 'react';
import { useUser } from '../context/UserContext';
import { UserSwitcher } from './UserSwitcher';
import { LifeBuoy, PlusCircle, LayoutDashboard, Shield } from 'lucide-react';

export function Navbar({ currentPage, onNavigate }) {
  const { isEmployee, isSupport } = useUser();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div 
            onClick={() => onNavigate(isSupport ? 'staff-dashboard' : 'employee-dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-100">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                SupportHub
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Workplace Ticket Management
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {isEmployee && (
                <>
                  <button
                    onClick={() => onNavigate('employee-dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                      currentPage === 'employee-dashboard'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => onNavigate('create-ticket')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                      currentPage === 'create-ticket'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>New Ticket</span>
                  </button>
                </>
              )}

              {isSupport && (
                <button
                  onClick={() => onNavigate('staff-dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    currentPage === 'staff-dashboard'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Support Queue</span>
                </button>
              )}
            </nav>

            {/* Persona Switcher */}
            <UserSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
