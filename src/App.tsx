import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { MyEventsPage } from './pages/MyEventsPage';
import { OrganiserDashboard } from './pages/OrganiserDashboard';
import { AuthModal } from './pages/AuthModal';
import { EventFormModal } from './components/EventFormModal';
import { api } from './services/api';
import { Calendar, Heart, Shield, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { role, switchRole, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState<boolean>(false);

  const handleQuickCreateSubmit = async (eventData: any) => {
    await api.createEvent(eventData);
    setIsQuickCreateOpen(false);
    // Switch to organiser view or refresh
    if (role === 'organiser') {
      setCurrentTab('organiser-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateEvent={() => setIsQuickCreateOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage 
            onSwitchToOrganiser={() => {
              switchRole('organiser');
              setCurrentTab('organiser-dashboard');
            }}
          />
        )}

        {currentTab === 'my-events' && (
          <MyEventsPage 
            onExploreClick={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'organiser-dashboard' && (
          <OrganiserDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-lg text-white">CampusConnect</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart campus event discovery and registration platform. Built for university communities, student councils, and campus organisers.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">For Students</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors">Explore Hackathons</button></li>
                <li><button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors">AI Masterclasses</button></li>
                <li><button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors">Esports Tournaments</button></li>
                <li><button onClick={() => setCurrentTab('my-events')} className="hover:text-white transition-colors">My Digital QR Passes</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">For Organisers</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => {
                      switchRole('organiser');
                      setCurrentTab('organiser-dashboard');
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    Organiser Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      switchRole('organiser');
                      setIsQuickCreateOpen(true);
                    }} 
                    className="hover:text-white transition-colors"
                  >
                    AI Event Generator
                  </button>
                </li>
                <li><button onClick={() => setCurrentTab('organiser-dashboard')} className="hover:text-white transition-colors">Attendee Rosters & Export</button></li>
                <li><button onClick={() => setCurrentTab('organiser-dashboard')} className="hover:text-white transition-colors">Capacity Analytics</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">System & AI</h4>
              <div className="space-y-2 text-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>API Status: Operational</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  AI Engine: Google Gemini 1.5 Flash + Intelligent Campus NLP
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset sample demo database to defaults?')) {
                        api.resetDemoData().then(() => window.location.reload());
                      }
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-300 underline"
                  >
                    Reset Demo Seed Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 CampusConnect Platform. Designed for modern university ecosystems.</p>
            <p className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
              <span>for collegiate excellence</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Quick Event Create Modal */}
      <EventFormModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSubmit={handleQuickCreateSubmit}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
