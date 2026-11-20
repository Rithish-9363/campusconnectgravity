import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Flame, 
  Compass, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { EventFilters } from '../components/EventFilters';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { TicketPassModal } from '../components/TicketPassModal';
import { CampusEvent, AIRecommendation } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onSwitchToOrganiser: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSwitchToOrganiser }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedSort, setSelectedSort] = useState('date');
  
  // AI recommendations
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Modals state
  const [activeModalEvent, setActiveModalEvent] = useState<CampusEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents({
        search: searchQuery,
        category: selectedCategory,
        timeframe: selectedTimeframe,
        sort: selectedSort
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingRecs(true);
      const recs = await api.getAIRecommendations();
      setRecommendations(recs);
    } catch (err) {
      console.warn('Recommendations fetch warning:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedCategory, selectedTimeframe, selectedSort, isAuthenticated]);

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated, user?.id]);

  // Event Handlers
  const handleRegister = async (eventId: string) => {
    const res = await api.registerForEvent(eventId);
    // Update local event state
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...res.event, isRegistered: true } : e));
    if (activeModalEvent && activeModalEvent.id === eventId) {
      setActiveModalEvent({ ...activeModalEvent, ...res.event, isRegistered: true });
    }
    fetchRecommendations();
  };

  const handleCancelRegistration = async (eventId: string) => {
    const res = await api.cancelRegistration(eventId);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...res.event, isRegistered: false } : e));
    if (activeModalEvent && activeModalEvent.id === eventId) {
      setActiveModalEvent({ ...activeModalEvent, ...res.event, isRegistered: false });
    }
    fetchRecommendations();
  };

  const handleToggleInterest = async (eventId: string) => {
    const res = await api.toggleInterest(eventId);
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      isInterested: res.interested,
      interestedCount: res.count
    } : e));
    if (activeModalEvent && activeModalEvent.id === eventId) {
      setActiveModalEvent({
        ...activeModalEvent,
        isInterested: res.interested,
        interestedCount: res.count
      });
    }
  };

  const handleViewDetails = (event: CampusEvent) => {
    setActiveModalEvent(event);
    setIsDetailOpen(true);
  };

  const handleViewTicket = (event: CampusEvent) => {
    setActiveModalEvent(event);
    setIsTicketOpen(true);
  };

  // Section Filters
  const todayEvents = events.filter(e => e.isToday);
  const thisWeekEvents = events.filter(e => e.isThisWeek && !e.isToday);
  const featuredEvents = events.filter(e => e.featured);

  const scrollToExplore = () => {
    const el = document.getElementById('events-feed-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Hero Banner Section */}
      <HeroSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExploreClick={scrollToExplore}
        onSwitchToOrganiser={onSwitchToOrganiser}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* AI Recommendations Section (For Logged-in Students) */}
        {isAuthenticated && recommendations.length > 0 && (
          <section className="p-6 rounded-3xl bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary-300" />
                  <span>AI Smart Match Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Recommended For You, {user?.name.split(' ')[0]}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Curated based on your interests in {user?.interests?.join(', ') || 'campus activities'} and your {user?.department || 'department'}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map(({ event, matchScore, matchReason }) => (
                <div 
                  key={event.id}
                  onClick={() => handleViewDetails(event)}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-400/20 text-primary-200 border border-primary-400/30">
                        {event.category}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        {matchScore}% Match
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm group-hover:text-primary-300 transition-colors line-clamp-1">
                      {event.title}
                    </h4>

                    <p className="text-[11px] text-primary-200 font-medium mt-1 line-clamp-1">
                      ✨ {matchReason}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-3">
                      <Calendar className="w-3.5 h-3.5 text-primary-300" />
                      <span>{event.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">
                      {event.seatLimit - (event.registeredCount || 0)} seats left
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        event.isRegistered ? handleViewTicket(event) : handleRegister(event.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-primary-50 transition-all"
                    >
                      {event.isRegistered ? 'View Pass' : '1-Click Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Happening Today (if any) */}
        {todayEvents.length > 0 && selectedTimeframe !== 'week' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Happening Today</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                    Live Now
                  </span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onRegister={handleRegister}
                  onToggleInterest={handleToggleInterest}
                  onViewTicket={handleViewTicket}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section: This Week (if any and not filtered away) */}
        {thisWeekEvents.length > 0 && selectedTimeframe === 'all' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  This Week on Campus
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thisWeekEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onRegister={handleRegister}
                  onToggleInterest={handleToggleInterest}
                  onViewTicket={handleViewTicket}
                />
              ))}
            </div>
          </section>
        )}

        {/* Main All Events Discovery Grid */}
        <section id="events-feed-section" className="space-y-6 pt-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                All Campus Events
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {events.length} upcoming events across engineering, arts, culture and sports
              </p>
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <EventFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
            todayCount={todayEvents.length}
            thisWeekCount={events.filter(e => e.isThisWeek).length}
          />

          {/* Events Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500">Discovering events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No events found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No events matched your current category or search filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedTimeframe('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onRegister={handleRegister}
                  onToggleInterest={handleToggleInterest}
                  onViewTicket={handleViewTicket}
                />
              ))}
            </div>
          )}

        </section>

      </div>

      {/* Details Modal */}
      <EventDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        event={activeModalEvent}
        onRegister={handleRegister}
        onToggleInterest={handleToggleInterest}
        onViewTicket={handleViewTicket}
      />

      {/* Ticket QR Modal */}
      <TicketPassModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        event={activeModalEvent}
        onCancelRegistration={handleCancelRegistration}
      />

    </div>
  );
};
