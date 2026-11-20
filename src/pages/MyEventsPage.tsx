import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  QrCode, 
  AlertCircle, 
  ArrowRight, 
  Heart,
  Trash2,
  CalendarPlus,
  Compass
} from 'lucide-react';
import { CampusEvent, Registration } from '../types';
import { api } from '../services/api';
import { TicketPassModal } from '../components/TicketPassModal';
import { useAuth } from '../context/AuthContext';

interface MyEventsPageProps {
  onExploreClick: () => void;
}

export const MyEventsPage: React.FC<MyEventsPageProps> = ({ onExploreClick }) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [interestedEvents, setInterestedEvents] = useState<CampusEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'registered' | 'interested'>('registered');
  const [loading, setLoading] = useState(true);

  // Active pass modal
  const [selectedEventForPass, setSelectedEventForPass] = useState<CampusEvent | null>(null);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regs, ints] = await Promise.all([
        api.getUserRegistrations(),
        api.getUserInterests()
      ]);
      setRegistrations(regs);
      setInterestedEvents(ints);
    } catch (err) {
      console.error('Error fetching user events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPass = (reg: Registration) => {
    if (reg.event) {
      setSelectedEventForPass(reg.event);
      setSelectedReg(reg);
      setIsPassModalOpen(true);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    await api.cancelRegistration(eventId);
    // Refresh lists
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Student Event Pass Wallet
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Campus Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Access your digital admission passes, confirmed seats, and bookmarked campus activities.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('registered')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'registered'
                  ? 'bg-white text-primary-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="w-4 h-4 text-primary-600" />
              <span>Registered ({registrations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('interested')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'interested'
                  ? 'bg-white text-primary-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>Saved ({interestedEvents.length})</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading your events...</p>
          </div>
        ) : activeTab === 'registered' ? (
          registrations.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No event registrations yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                You haven't booked seats for any upcoming campus events. Browse the live schedule to reserve your spot!
              </p>
              <button
                onClick={onExploreClick}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all inline-flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Campus Events</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registrations.map(reg => {
                const event = reg.event;
                if (!event) return null;

                return (
                  <div 
                    key={reg.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Top Bar: Pass code & status */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg border border-primary-200">
                            {reg.ticketCode}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Confirmed
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-slate-400">
                          {event.category}
                        </span>
                      </div>

                      {/* Event Main info */}
                      <div className="mt-4 flex gap-4">
                        <img 
                          src={event.banner} 
                          alt={event.title}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100" 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                            {event.title}
                          </h3>

                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                              <span>{event.date}</span>
                              <span>•</span>
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCancelRegistration(event.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors py-2 px-2 rounded-lg"
                        title="Cancel registration"
                      >
                        Cancel Seat
                      </button>

                      <button
                        onClick={() => handleOpenPass(reg)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View QR Admission Pass</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Interested / Bookmarks
          interestedEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No saved events</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Click the heart icon on any campus event card to save it here for later.
              </p>
              <button
                onClick={onExploreClick}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Browse Campus Schedule</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interestedEvents.map(event => (
                <div 
                  key={event.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img 
                      src={event.banner} 
                      alt={event.title} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0" 
                    />
                    <div>
                      <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                        {event.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {event.date} • {event.venue}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {event.seatLimit - (event.registeredCount || 0)} seats left
                    </span>
                    <button
                      onClick={onExploreClick}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all"
                    >
                      View Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>

      {/* Ticket QR Modal */}
      <TicketPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        event={selectedEventForPass}
        registrationDetails={selectedReg}
        onCancelRegistration={handleCancelRegistration}
      />

    </div>
  );
};
