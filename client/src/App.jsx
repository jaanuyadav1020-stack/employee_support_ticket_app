import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from './context/UserContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { TicketForm } from './components/TicketForm';
import { ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

export function App() {
  const { currentUser, isSupport, loading: userLoading } = useUser();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoadingTickets(true);
      const res = await api.getTickets({}, currentUser.id);
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTickets();
    // Whenever user switches persona, if we were in a ticket detail view that doesn't belong to them,
    // clear selected ticket if employee
    if (selectedTicketId && currentUser && !isSupport) {
      // Re-verify after fetch
    }
  }, [fetchTickets, currentUser]);

  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    // Navigate straight to newly created ticket
    setSelectedTicketId(newTicket.id);
  };

  const handleStatusChanged = (updatedTicket) => {
    setTickets(prev =>
      prev.map(t => (t.id === updatedTicket.id ? { ...t, status: updatedTicket.status } : t))
    );
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Initializing workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation */}
      <Navbar
        activeView={selectedTicketId ? 'detail' : 'list'}
        setActiveView={() => setSelectedTicketId(null)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Role Banner Indicator */}
      <div className={`py-1.5 px-4 text-xs font-medium text-center border-b ${
        isSupport
          ? 'bg-purple-100 text-purple-900 border-purple-200'
          : 'bg-indigo-50 text-indigo-900 border-indigo-100'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          {isSupport ? (
            <>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span><strong>Support Staff Mode:</strong> You can view all employee tickets, change ticket statuses, and respond with staff guidance.</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span><strong>Employee Mode:</strong> You can submit tickets, view your own submitted issues, and follow up in discussion comments.</span>
            </>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTicketId ? (
          <TicketDetail
            ticketId={selectedTicketId}
            onBack={() => {
              setSelectedTicketId(null);
              fetchTickets();
            }}
            onStatusChanged={handleStatusChanged}
          />
        ) : (
          <TicketList
            tickets={tickets}
            loading={loadingTickets}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}
      </main>

      {/* Modal Ticket Submission */}
      <TicketForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>Employee Support Ticket Management Application &bull; Built with React, Express, and SQLite</p>
      </footer>
    </div>
  );
}
