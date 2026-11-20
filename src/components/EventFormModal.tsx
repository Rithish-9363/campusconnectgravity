import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Image as ImageIcon, 
  Tag, 
  Check, 
  Loader2 
} from 'lucide-react';
import { CampusEvent, EventCategory } from '../types';
import { api } from '../services/api';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<CampusEvent>) => Promise<void>;
  initialEvent?: CampusEvent | null;
}

const CATEGORIES: EventCategory[] = [
  'Technology',
  'Hackathons',
  'Workshops',
  'Cultural',
  'Sports',
  'Career',
  'Arts',
  'Gaming'
];

const PRESET_BANNERS: Array<{ label: string; url: string }> = [
  { label: 'Hackathon & Coding', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200' },
  { label: 'AI & Deep Tech', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Esports & Gaming', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Acoustic & Concert', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Design & UX Studio', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Career Fair & Networking', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Collegiate Basketball', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Art Gallery Showcase', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200' }
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialEvent
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technology');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 01:00 PM');
  const [venue, setVenue] = useState('');
  const [seatLimit, setSeatLimit] = useState(100);
  const [banner, setBanner] = useState(PRESET_BANNERS[0].url);
  const [tagsInput, setTagsInput] = useState('');
  const [featured, setFeatured] = useState(false);

  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setDescription(initialEvent.description || '');
      setCategory(initialEvent.category || 'Technology');
      setDate(initialEvent.date || '');
      setTime(initialEvent.time || '10:00 AM - 01:00 PM');
      setVenue(initialEvent.venue || '');
      setSeatLimit(initialEvent.seatLimit || 100);
      setBanner(initialEvent.banner || PRESET_BANNERS[0].url);
      setTagsInput(initialEvent.tags ? initialEvent.tags.join(', ') : '');
      setFeatured(Boolean(initialEvent.featured));
    } else {
      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDateStr = tomorrow.toISOString().split('T')[0];

      setTitle('');
      setDescription('');
      setCategory('Technology');
      setDate(defaultDateStr);
      setTime('10:00 AM - 01:00 PM');
      setVenue('Campus Innovation Center, Room 204');
      setSeatLimit(100);
      setBanner(PRESET_BANNERS[0].url);
      setTagsInput('Technology, Workshop, Campus');
      setFeatured(false);
      setAiPrompt('');
      setAiSuccessMessage('');
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  // AI Copilot Generator
  const handleAIAssist = async () => {
    const inputTopic = aiPrompt.trim() || title.trim();
    if (!inputTopic) {
      alert('Please enter a short event idea or title in the prompt box first (e.g. "Game dev jam 48 hours with unity and prizes")');
      return;
    }

    setIsGeneratingAI(true);
    setAiSuccessMessage('');
    try {
      const generated = await api.generateAIEventCopy({
        topic: inputTopic,
        category: category !== 'Technology' ? category : undefined
      });

      if (generated) {
        setTitle(generated.title);
        setDescription(generated.description);
        if (generated.category && CATEGORIES.includes(generated.category as EventCategory)) {
          setCategory(generated.category as EventCategory);
        }
        if (generated.suggestedTags && generated.suggestedTags.length > 0) {
          setTagsInput(generated.suggestedTags.join(', '));
        }

        // Auto select matching banner preset
        const matchingBanner = PRESET_BANNERS.find(b => 
          b.label.toLowerCase().includes(generated.category?.toLowerCase() || '')
        );
        if (matchingBanner) {
          setBanner(matchingBanner.url);
        }

        setAiSuccessMessage(`Generated by ${generated.aiSource || 'CampusConnect AI'}!`);
        setTimeout(() => setAiSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      alert('AI Generation error: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !venue || !date || !seatLimit) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await onSubmit({
        title,
        description,
        category,
        date,
        time,
        venue,
        seatLimit: Number(seatLimit),
        banner,
        tags,
        featured
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-5 bg-white border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {initialEvent ? 'Edit Campus Event' : 'Create New Campus Event'}
            </h2>
            <p className="text-xs text-slate-500">
              {initialEvent ? 'Update event schedule and details' : 'Publish an event in under 60 seconds with AI assistance'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* AI Event Copilot Assistant Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary-50 via-indigo-50/50 to-purple-50 border border-primary-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-primary-900">
                <Sparkles className="w-4 h-4 text-primary-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>AI Event Creator Copilot</span>
              </span>
              {aiSuccessMessage && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-fade-in">
                  {aiSuccessMessage}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 24hr AI Hackathon with $5000 prizes, pizza, and mentor clinics"
                className="flex-1 px-3.5 py-2 text-xs text-slate-900 bg-white border border-primary-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAIAssist}
                disabled={isGeneratingAI}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-primary-600 hover:bg-primary-700 text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Event</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Enter a rough idea or keywords to auto-generate the title, engaging description, category, and smart tags!
            </p>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HackCampus 2026: 24-Hour AI & Web3 Sprint"
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
            />
          </div>

          {/* Category & Seat Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-semibold cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seat Capacity Limit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="2000"
                  required
                  value={seatLimit}
                  onChange={(e) => setSeatLimit(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-semibold"
                />
                <Users className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Date, Time & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 AM - 02:00 PM"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Turing Hall or Campus Lawn"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed overview of what students will experience, learn, or win..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 leading-relaxed font-normal"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="AI, Coding, Hackathon, Prizes, Team"
                className="w-full px-3.5 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Banner Selector (Presets + Custom URL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Event Banner Image
            </label>
            
            {/* Presets Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 mb-3">
              {PRESET_BANNERS.map((preset, idx) => (
                <div 
                  key={idx}
                  onClick={() => setBanner(preset.url)}
                  className={`relative aspect-16/9 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    banner === preset.url 
                      ? 'border-primary-600 ring-2 ring-primary-200 scale-98' 
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  {banner === preset.url && (
                    <div className="absolute inset-0 bg-primary-600/30 flex items-center justify-center text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="Or paste custom image URL: https://..."
                className="w-full px-3.5 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured-toggle"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded-sm border-slate-300 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="featured-toggle" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Mark as Featured Event (prominently highlighted on homepage)
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialEvent ? 'Save Changes' : 'Publish Event'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
