import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await api.getUsers();
        setUsers(res.users);

        // Pick saved user from localStorage or default to first employee
        const savedId = localStorage.getItem('support_app_user_id');
        const matched = res.users.find(u => u.id === savedId);
        const selected = matched || res.users[0];

        setCurrentUser(selected || null);
        if (selected) {
          localStorage.setItem('support_app_user_id', selected.id);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Unable to load users. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const switchUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('support_app_user_id', user.id);
    } else {
      localStorage.removeItem('support_app_user_id');
    }
  };

  const isSupport = currentUser?.role === 'SUPPORT';
  const isEmployee = currentUser?.role === 'EMPLOYEE';

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        switchUser,
        isSupport,
        isEmployee,
        loading,
        error
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
