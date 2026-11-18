import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from './context/UserContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { TicketDetailsPage } from './pages/TicketDetailsPage';
import { SupportStaffDashboard } from './pages/SupportStaffDashboard';
import { ShieldCheck, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const { currentUser, isSupport, isEmployee, loading: userLoading, error: userError } = useUser();
  const [currentPage, setCurrentPage] = useState('employee-dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState(null);

  // Sync default page with active role on user persona switch
  useEffect(() => {
    if (currentUser) {
      if (isSupport) {
        // If current page is an employee-specific page, shift to staff dashboard
        if (currentPage === 'employee-dashboard' || currentPage === 'create-ticket') {
          setCurrentPage('staff-dashboard');
        }
      } else {
        // If current page is staff dashboard, shift to employee dashboard
        if (currentPage === 'staff-dashboard') {
          setCurrentPage('employee-dashboard');
        }
      }
    }
  }, [currentUser, isSupport]);

  // Fetch tickets for active user from backend API
  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoadingTickets(true);
      setTicketError(null);
      const res = await api.getTickets({}, currentUser.id);
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setTicketError(err.message || 'Failed to connect to backend server. Make sure port 5000 is running.');
    } finally {
      setLoadingTickets(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
    setCurrentPage('ticket-details');
  };

  const handleStatusChanged = (updatedTicket) => {
    setTickets(prev =>
      prev.map(t => (t.id === updatedTicket.id ? { ...t, status: updatedTicket.status } : t))
    );
  };

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setCurrentPage('ticket-details');
  };

  const handleBackToDashboard = () => {
    setSelectedTicketId(null);
    setCurrentPage(isSupport ? 'staff-dashboard' : 'employee-dashboard');
    fetchTickets();
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Connecting to Support Hub API...</span>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-rose-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Backend Connection Error</h2>
          <p className="text-xs text-slate-600">{userError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setSelectedTicketId(null);
          setCurrentPage(page);
        }}
      />

      {/* Role State Banner */}
      <div className={`py-2 px-4 text-xs font-medium text-center border-b ${
        isSupport
          ? 'bg-purple-100 text-purple-900 border-purple-200'
          : 'bg-indigo-50 text-indigo-900 border-indigo-100'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          {isSupport ? (
            <>
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
              <span><strong>Support Staff Mode:</strong> Viewing all company workplace tickets. You can update ticket statuses and post staff guidance.</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span><strong>Employee Mode:</strong> Viewing only tickets submitted by you. You can report workplace problems and converse via comments.</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ticketError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{ticketError}</span>
          </div>
        )}

        {/* Page Routing */}
        {currentPage === 'employee-dashboard' && (
          <EmployeeDashboard
            tickets={tickets}
            loading={loadingTickets}
            onSelectTicket={handleSelectTicket}
            onNavigateCreate={() => setCurrentPage('create-ticket')}
          />
        )}

        {currentPage === 'create-ticket' && (
          <CreateTicketPage
            onBack={() => setCurrentPage('employee-dashboard')}
            onTicketCreated={handleTicketCreated}
          />
        )}

        {currentPage === 'ticket-details' && selectedTicketId && (
          <TicketDetailsPage
            ticketId={selectedTicketId}
            onBack={handleBackToDashboard}
            onStatusChanged={handleStatusChanged}
          />
        )}

        {currentPage === 'staff-dashboard' && (
          <SupportStaffDashboard
            tickets={tickets}
            loading={loadingTickets}
            onSelectTicket={handleSelectTicket}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>Employee Support Ticket Management Application &bull; React &bull; Node.js/Express &bull; SQLite</p>
      </footer>
    </div>
  );
}
