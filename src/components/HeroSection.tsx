import React from 'react';
import { Sparkles, Search, Compass, Calendar, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExploreClick: () => void;
  onSwitchToOrganiser: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onExploreClick,
  onSwitchToOrganiser
}) => {
  const { role } = useAuth();

  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-18 bg-gradient-to-b from-slate-100/80 via-white to-slate-50 border-b border-slate-200/60">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200/80 text-primary-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-4 h-4 text-primary-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Smart Campus Event Discovery Platform 2026</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          <span className="text-slate-600 font-medium hidden sm:inline">AI Powered</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
          Discover Campus Life. <br className="hidden sm:inline" />
          <span className="text-gradient">Register in 1-Click.</span> Never Miss Out.
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          The unified platform for students to explore hackathons, workshops, esports, and cultural festivals. 
          Instant digital QR passes, smart category filters, and personalized AI recommendations.
        </p>

        {/* Quick Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-lg shadow-primary-500/5 rounded-2xl bg-white border border-slate-200/80 p-2 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, AI workshops, esports, guest lectures..."
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={onExploreClick}
              className="ml-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Popular:</span>
            {['AI Sprint', 'Esports', 'UI/UX Workshop', 'Career Fair', 'Acoustic Jam'].map(term => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onExploreClick}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all"
          >
            <Compass className="w-4 h-4 text-primary-400" />
            Browse Upcoming Events
          </button>

          {role === 'student' ? (
            <button
              onClick={onSwitchToOrganiser}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all"
            >
              <span>🏛️ Try Organiser Mode</span>
            </button>
          ) : (
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all"
            >
              <span>🎓 Student Discovery Feed</span>
            </button>
          )}
        </div>

        {/* Live Feature Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-200/60 pt-8">
          <div className="text-center p-3 rounded-xl bg-white/60 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-primary-600 font-extrabold text-2xl sm:text-3xl">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>10+</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Live Campus Events</p>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/60 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-slate-900 font-extrabold text-2xl sm:text-3xl">
              <span>1,200+</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Registered Students</p>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/60 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-extrabold text-2xl sm:text-3xl">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>1-Click</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Digital QR Passes</p>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/60 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-primary-600 font-extrabold text-2xl sm:text-3xl">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span>98%</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">AI Recommendation Match</p>
          </div>
        </div>

      </div>
    </div>
  );
};
