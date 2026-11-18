const API_BASE = '/api';

export async function request(endpoint, options = {}, userId = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error! Status: ${response.status}`;
    const err = new Error(errorMsg);
    err.details = data.details;
    err.status = response.status;
    throw err;
  }

  return data;
}

export const api = {
  // Users
  getUsers: () => request('/users'),
  getCurrentUser: (userId) => request('/users/me', {}, userId),

  // Tickets
  getTickets: (filters = {}, userId) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/tickets${qs}`, {}, userId);
  },

  getTicketById: (id, userId) => request(`/tickets/${id}`, {}, userId),

  createTicket: (ticketData, userId) =>
    request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    }, userId),

  updateTicketStatus: (id, status, userId) =>
    request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, userId),

  // Comments
  getComments: (ticketId, userId) => request(`/tickets/${ticketId}/comments`, {}, userId),

  addComment: (ticketId, message, userId) =>
    request(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message })
    }, userId)
};
