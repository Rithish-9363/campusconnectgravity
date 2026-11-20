import React from 'react';
import { 
  Laptop, 
  Code2, 
  Wrench, 
  Music, 
  Trophy, 
  Briefcase, 
  Palette, 
  Gamepad2, 
  Grid,
  Clock,
  Flame,
  CalendarDays
} from 'lucide-react';
import { EventCategory } from '../types';

interface EventFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (tf: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  todayCount?: number;
  thisWeekCount?: number;
}

const CATEGORIES: Array<{ id: string; label: string; icon: React.ReactNode }> = [
  { id: 'All', label: 'All Events', icon: <Grid className="w-4 h-4" /> },
  { id: 'Technology', label: 'Technology', icon: <Laptop className="w-4 h-4" /> },
  { id: 'Hackathons', label: 'Hackathons', icon: <Code2 className="w-4 h-4" /> },
  { id: 'Workshops', label: 'Workshops', icon: <Wrench className="w-4 h-4" /> },
  { id: 'Cultural', label: 'Cultural', icon: <Music className="w-4 h-4" /> },
  { id: 'Sports', label: 'Sports', icon: <Trophy className="w-4 h-4" /> },
  { id: 'Career', label: 'Career', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'Arts', label: 'Arts', icon: <Palette className="w-4 h-4" /> },
  { id: 'Gaming', label: 'Gaming', icon: <Gamepad2 className="w-4 h-4" /> },
];

export const EventFilters: React.FC<EventFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedTimeframe,
  setSelectedTimeframe,
  selectedSort,
  setSelectedSort,
  todayCount = 0,
  thisWeekCount = 0
}) => {
  return (
    <div className="space-y-4">
      
      {/* Timeframe Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedTimeframe('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedTimeframe === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Events
          </button>

          <button
            onClick={() => setSelectedTimeframe('today')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedTimeframe === 'today'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100/80'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Happening Today</span>
            {todayCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedTimeframe === 'today' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'
              }`}>
                {todayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedTimeframe('week')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedTimeframe === 'week'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-primary-700 bg-primary-50 hover:bg-primary-100/80'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>This Week</span>
            {thisWeekCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedTimeframe === 'week' ? 'bg-primary-700 text-white' : 'bg-primary-200 text-primary-900'
              }`}>
                {thisWeekCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedTimeframe('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedTimeframe === 'upcoming'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upcoming Only
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 w-full sm:w-auto justify-end">
          <span className="shrink-0">Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="date">Date (Earliest)</option>
            <option value="popular">Most Popular 🔥</option>
            <option value="seats">Seats Available</option>
            <option value="date_desc">Recently Added</option>
          </select>
        </div>

      </div>

      {/* Category Pills Bar (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white font-bold shadow-sm shadow-primary-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
            }`}
          >
            <span className={selectedCategory === cat.id ? 'text-white' : 'text-slate-400'}>
              {cat.icon}
            </span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
};
