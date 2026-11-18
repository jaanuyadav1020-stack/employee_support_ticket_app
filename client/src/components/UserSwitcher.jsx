import React from 'react';
import { useUser } from '../context/UserContext';
import { Users, Shield, User } from 'lucide-react';

export function UserSwitcher() {
  const { users, currentUser, switchUser } = useUser();

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1.5 shadow-xs">
      <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-slate-500">
        <Users className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Active Persona:</span>
      </div>

      <div className="flex items-center gap-1">
        {users.map(u => {
          const isSelected = currentUser?.id === u.id;
          const isStaff = u.role === 'SUPPORT';

          return (
            <button
              key={u.id}
              onClick={() => switchUser(u)}
              title={`${u.name} (${u.role}) - ${u.email}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isSelected
                  ? isStaff
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isStaff ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span>{u.name.split(' ')[0]}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
              }`}>
                {isStaff ? 'Staff' : 'Emp'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
