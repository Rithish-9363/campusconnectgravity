import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Ticket
} from 'lucide-react';
import { CampusEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface EventCardProps {
  event: CampusEvent;
  onViewDetails: (event: CampusEvent) => void;
  onRegister: (eventId: string) => Promise<void>;
  onToggleInterest: (eventId: string) => Promise<void>;
  onViewTicket?: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
  onToggleInterest,
  onViewTicket
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const remaining = event.remainingSeats ?? Math.max(0, event.seatLimit - (event.registeredCount || 0));
  const isSoldOut = remaining <= 0;
  const isRegistered = event.isRegistered;
  const isInterested = event.isInterested;

  // Format readable date e.g. "Sat, Nov 22, 2026"
  const formattedDate = new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleRegisterClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isRegistered && onViewTicket) {
      onViewTicket(event);
      return;
    }

    if (isSoldOut) return;

    setIsRegistering(true);
    try {
      await onRegister(event.id);
      // Trigger subtle celebration confetti
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleInterestClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setIsLiking(true);
    try {
      await onToggleInterest(event.id);
    } finally {
      setIsLiking(false);
    }
  };

  // Determine Category Badge Color
  const categoryStyles: Record<string, string> = {
    Technology: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Hackathons: 'bg-purple-50 text-purple-700 border-purple-200',
    Workshops: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cultural: 'bg-pink-50 text-pink-700 border-pink-200',
    Sports: 'bg-amber-50 text-amber-700 border-amber-200',
    Career: 'bg-blue-50 text-blue-700 border-blue-200',
    Arts: 'bg-rose-50 text-rose-700 border-rose-200',
    Gaming: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <div 
      onClick={() => onViewDetails(event)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-primary-300 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Banner Image Container */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {/* Status Badges */}
            {event.isToday && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                TODAY
              </span>
            )}

            {!event.isToday && event.isThisWeek && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-600 text-white shadow-md">
                THIS WEEK
              </span>
            )}

            {event.dynamicStatus === 'completed' && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800/90 text-slate-200 backdrop-blur-xs">
                COMPLETED
              </span>
            )}

            {isSoldOut && event.dynamicStatus !== 'completed' && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md">
                FULL
              </span>
            )}

            {event.featured && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 shadow-md">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          {/* Interested Bookmark Heart */}
          <button
            onClick={handleInterestClick}
            disabled={isLiking}
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
              isInterested 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-red-500'
            }`}
            title={isInterested ? 'Remove from interested' : 'Mark as interested'}
          >
            <Heart className={`w-4 h-4 ${isInterested ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Category Pill Overlaid at bottom left of banner */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border backdrop-blur-md ${categoryStyles[event.category] || 'bg-white/90 text-slate-800'}`}>
            {event.category}
          </span>
          <span className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400 fill-current" />
            {event.interestedCount || 0}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {/* Meta Details: Date, Time, Venue */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
              <span className="font-semibold text-slate-800">{formattedDate}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Description Snippet */}
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Capacity Gauge & Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          
          {/* Seat Capacity Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="flex items-center gap-1 text-slate-500">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Seats Booked:</span>
              </span>
              <span className={`font-bold ${
                isSoldOut 
                  ? 'text-red-600' 
                  : remaining < 10 
                  ? 'text-amber-600' 
                  : 'text-slate-700'
              }`}>
                {event.registeredCount || 0} / {event.seatLimit} ({remaining} left)
              </span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
          </div>

          {/* Button Row */}
          <div className="flex items-center gap-2">
            {isRegistered ? (
              <button
                onClick={handleRegisterClick}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Registered (View Pass)</span>
              </button>
            ) : isSoldOut ? (
              <button
                disabled
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Sold Out</span>
              </button>
            ) : event.dynamicStatus === 'completed' ? (
              <button
                disabled
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1"
              >
                <span>Event Ended</span>
              </button>
            ) : (
              <button
                onClick={handleRegisterClick}
                disabled={isRegistering}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-4 h-4" />
                <span>{isRegistering ? 'Booking...' : 'Register in 1-Click'}</span>
              </button>
            )}

            <button
              onClick={() => onViewDetails(event)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shrink-0"
              title="View full event details"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
