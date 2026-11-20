const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cc_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async demoLogin(role: 'student' | 'organiser') {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async signup(payload: { name: string; email: string; password: string; role: string; department?: string; interests?: string[] }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ user: any }>(res);
  },

  // Events
  async getEvents(params?: { search?: string; category?: string; timeframe?: string; sort?: string; featuredOnly?: boolean }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.timeframe) query.append('timeframe', params.timeframe);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.featuredOnly) query.append('featuredOnly', 'true');

    const res = await fetch(`${API_BASE}/events?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  async getEventById(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  async createEvent(eventData: any) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse<any>(res);
  },

  async updateEvent(id: string, updates: any) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    return handleResponse<any>(res);
  },

  async deleteEvent(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Registrations & Interests
  async registerForEvent(eventId: string) {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse<{ success: boolean; registration: any; event: any; message: string }>(res);
  },

  async cancelRegistration(eventId: string) {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string; event: any }>(res);
  },

  async toggleInterest(eventId: string) {
    const res = await fetch(`${API_BASE}/events/${eventId}/interest`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ interested: boolean; count: number }>(res);
  },

  async getUserRegistrations() {
    const res = await fetch(`${API_BASE}/user/registrations`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  async getUserInterests() {
    const res = await fetch(`${API_BASE}/user/interests`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  async getEventAttendees(eventId: string) {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendees`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  // AI Integration
  async generateAIEventCopy(params: { topic: string; audience?: string; category?: string; rawInput?: string }) {
    const res = await fetch(`${API_BASE}/ai/generate-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(params),
    });
    return handleResponse<{
      title: string;
      tagline: string;
      description: string;
      category: string;
      suggestedTags: string[];
      agenda: string[];
      prerequisites: string;
      aiSource: string;
    }>(res);
  },

  async suggestCategory(title: string, description: string) {
    const res = await fetch(`${API_BASE}/ai/suggest-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    return handleResponse<{ category: string }>(res);
  },

  async getAIRecommendations() {
    const res = await fetch(`${API_BASE}/ai/recommendations`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async triggerReminderAlert() {
    const res = await fetch(`${API_BASE}/notifications/trigger-reminder`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  // Organiser Analytics
  async getOrganiserAnalytics() {
    const res = await fetch(`${API_BASE}/organiser/analytics`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  // Reset Demo
  async resetDemoData() {
    const res = await fetch(`${API_BASE}/system/reset-demo`, {
      method: 'POST',
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};
