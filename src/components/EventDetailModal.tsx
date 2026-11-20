import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  ExternalLink,
  Ticket,
  Sparkles,
  CalendarPlus
} from 'lucide-react';
import { CampusEvent, Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
  registrationDetails?: Registration | null;
  onRegister: (eventId: string) => Promise<void>;
  onToggleInterest: (eventId: string) => Promise<void>;
  onViewTicket: (event: CampusEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  registrationDetails,
  onRegister,
  onToggleInterest,
  onViewTicket
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !event) return null;

  const remaining = event.remainingSeats ?? Math.max(0, event.seatLimit - (event.registeredCount || 0));
  const isSoldOut = remaining <= 0;
  const isRegistered = event.isRegistered;
  const isInterested = event.isInterested;

  const handleRegister = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (isRegistered) {
      onViewTicket(event);
      return;
    }
    if (isSoldOut) return;

    setIsRegistering(true);
    try {
      await onRegister(event.id);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/#event-' + event.id);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Google Calendar Link generator
  const createGoogleCalendarLink = () => {
    const cleanDate = event.date.replace(/-/g, '');
    const startTime = `${cleanDate}T090000Z`;
    const endTime = `${cleanDate}T170000Z`;
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.venue);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Banner with Overlays */}
        <div className="relative aspect-21/9 w-full bg-slate-900 overflow-hidden">
          <img 
            src={event.banner} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Status Pills */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary-600 text-white shadow-md">
              {event.category}
            </span>
            {event.isToday && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                HAPPENING TODAY
              </span>
            )}
            {!event.isToday && event.isThisWeek && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
                THIS WEEK
              </span>
            )}
          </div>

          {/* Title and Organizer placed over bottom banner */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight drop-shadow-md">
              {event.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-200 font-medium">
              <span>Organized by: <strong className="text-white">{event.organiserName || 'Campus Events Council'}</strong></span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Date</p>
                <p className="text-sm font-bold text-slate-900">{event.date}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Time</p>
                <p className="text-sm font-bold text-slate-900">{event.time}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Venue</p>
                <p className="text-sm font-bold text-slate-900 truncate">{event.venue}</p>
              </div>
            </div>
          </div>

          {/* Seat Capacity Gauge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                <Users className="w-4 h-4 text-primary-500" />
                <span>Attendance & Capacity Status</span>
              </span>
              <span className="text-slate-900 font-extrabold">
                {event.registeredCount || 0} / {event.seatLimit} Registered ({remaining} seats remaining)
              </span>
            </div>
            
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut 
                    ? 'bg-red-500' 
                    : remaining < 10 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, ((event.registeredCount || 0) / event.seatLimit) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <span>{Math.round(((event.registeredCount || 0) / event.seatLimit) * 100)}% capacity booked</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400 fill-current" />
                {event.interestedCount || 0} students interested
              </span>
            </div>
          </div>

          {/* About Event */}
          <div>
            <h4 className="text-base font-extrabold text-slate-900 mb-2">About This Event</h4>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Agenda & Highlights if available */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h4 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span>Event Schedule & Agenda</span>
              </h4>
              <div className="space-y-2">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium pt-0.5">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Topics & Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="sticky bottom-0 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleInterest(event.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isInterested 
                  ? 'bg-red-50 text-red-600 border-red-200' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInterested ? 'fill-current text-red-500' : ''}`} />
              <span>{isInterested ? 'Interested' : 'Interested'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
            </button>

            <a
              href={createGoogleCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all"
            >
              <CalendarPlus className="w-4 h-4 text-primary-600" />
              <span>Add to Google Cal</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {isRegistered ? (
              <button
                onClick={() => onViewTicket(event)}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View Digital Pass</span>
              </button>
            ) : isSoldOut ? (
              <button
                disabled
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Sold Out</span>
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>{isRegistering ? 'Reserving Seat...' : 'Register in 1-Click'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
