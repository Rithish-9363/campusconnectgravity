import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Users, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  Clock, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { CampusEvent, OrganiserAnalytics } from '../types';
import { api } from '../services/api';
import { EventFormModal } from '../components/EventFormModal';
import { AttendeeListModal } from '../components/AttendeeListModal';
import { EventDetailModal } from '../components/EventDetailModal';

export const OrganiserDashboard: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [analytics, setAnalytics] = useState<OrganiserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);

  const [attendeeModalEventId, setAttendeeModalEventId] = useState<string | null>(null);
  const [attendeeModalEventTitle, setAttendeeModalEventTitle] = useState('');
  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);

  const [detailEvent, setDetailEvent] = useState<CampusEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, analyticsData] = await Promise.all([
        api.getEvents(),
        api.getOrganiserAnalytics()
      ]);
      setEvents(eventsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load organiser data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: CampusEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This will cancel all student registrations for this event.`)) {
      return;
    }
    try {
      await api.deleteEvent(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const handleFormSubmit = async (eventData: Partial<CampusEvent>) => {
    if (editingEvent) {
      await api.updateEvent(editingEvent.id, eventData);
    } else {
      await api.createEvent(eventData);
    }
    fetchData();
  };

  const handleOpenAttendees = (event: CampusEvent) => {
    setAttendeeModalEventId(event.id);
    setAttendeeModalEventTitle(event.title);
    setIsAttendeeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Campus Event Coordinator Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Organiser Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Publish campus events with AI assistance, monitor seat occupancy, and manage registered attendees.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Event</span>
          </button>
        </div>

        {/* Analytics Key Metrics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Events</span>
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {analytics.totalEvents}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Published on CampusConnect</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Bookings</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {analytics.totalRegistrations}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Confirmed student registrations</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Avg Occupancy</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {analytics.avgFillRate}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Seat capacity utilization</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Student Interest</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {analytics.totalInterested}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Students bookmarked events</p>
            </div>

          </div>
        )}

        {/* Events Management Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Campus Events Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of registrations, capacity limits, and attendee rosters
              </p>
            </div>

            <button
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span>AI Create Event (&lt; 1 min)</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No events found. Click "Publish New Event" to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Event Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Schedule</th>
                    <th className="py-3.5 px-4">Registrations & Capacity</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {events.map(event => {
                    const booked = event.registeredCount || 0;
                    const limit = event.seatLimit;
                    const fillPercent = Math.min(100, Math.round((booked / limit) * 100));
                    const isFull = booked >= limit;

                    return (
                      <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Event Title & Banner */}
                        <td className="py-4 px-6 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img 
                              src={event.banner} 
                              alt={event.title}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate">
                                {event.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{event.venue}</span>
                              </div>
                              {event.isToday && (
                                <span className="inline-block mt-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                  HAPPENING TODAY
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
                            {event.category}
                          </span>
                        </td>

                        {/* Schedule */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{event.date}</p>
                          <p className="text-[11px] text-slate-500">{event.time}</p>
                        </td>

                        {/* Registration Gauge */}
                        <td className="py-4 px-4 whitespace-nowrap min-w-[180px]">
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                            <span className={isFull ? 'text-red-600' : 'text-slate-800'}>
                              {booked} / {limit} booked
                            </span>
                            <span className="text-slate-400 font-medium">
                              {fillPercent}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? 'bg-red-500' : fillPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {limit - booked} seats left
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View Attendees */}
                            <button
                              onClick={() => handleOpenAttendees(event)}
                              className="p-2 rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 font-semibold transition-all flex items-center gap-1 text-[11px] px-2.5"
                              title="View registered student attendees"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Attendees ({booked})</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(event)}
                              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                              title="Edit event details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(event.id, event.title)}
                              className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                              title="Delete event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Category Breakdown & Recent Activity */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Performance */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Category Distribution & Registrations
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Which campus categories drive the highest student participation
              </p>

              <div className="space-y-3">
                {analytics.categoryList.map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{cat.category}</span>
                      <span className="text-slate-500">
                        {cat.registrations} registrations • {cat.events} events
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-primary-600"
                        style={{ width: `${Math.min(100, (cat.registrations / Math.max(1, analytics.totalRegistrations)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Registrations Feed */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Live Student Registration Feed
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Real-time stream of incoming event signups across the university
              </p>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {analytics.recentRegistrations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No registrations yet.</p>
                ) : (
                  analytics.recentRegistrations.map((reg, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{reg.userName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {reg.eventTitle}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                          {reg.ticketCode}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(reg.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Event Create / Edit Form Modal */}
      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialEvent={editingEvent}
      />

      {/* Attendee Roster Modal */}
      <AttendeeListModal
        isOpen={isAttendeeModalOpen}
        onClose={() => setIsAttendeeModalOpen(false)}
        eventId={attendeeModalEventId}
        eventTitle={attendeeModalEventTitle}
      />

    </div>
  );
};
