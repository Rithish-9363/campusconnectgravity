import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Ticket, 
  Compass, 
  Layers, 
  Check, 
  ChevronDown, 
  Menu, 
  X,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AppNotification } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCreateEvent?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCreateEvent }) => {
  const { user, role, switchRole, logout, openAuthModal, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      // ignore in offline/unauth
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Polling for live notifications
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSimulatedReminder = async () => {
    try {
      const newNotif = await api.triggerReminderAlert();
      setNotifications(prev => [newNotif, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo events, users, and registrations to factory defaults?')) return;
    setIsResetting(true);
    try {
      await api.resetDemoData();
      window.location.reload();
    } catch (e) {
      alert('Failed to reset demo: ' + e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 ring-2 ring-primary-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Campus<span className="text-primary-600">Connect</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wide font-medium -mt-1 hidden sm:block">
                Smart Event Discovery Platform
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Events
            </button>

            {role === 'student' && (
              <button
                onClick={() => setCurrentTab('my-events')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'my-events'
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Events
              </button>
            )}

            {role === 'organiser' && (
              <button
                onClick={() => setCurrentTab('organiser-dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'organiser-dashboard'
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Organiser Portal
              </button>
            )}

            {role === 'organiser' && onOpenCreateEvent && (
              <button
                onClick={onOpenCreateEvent}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Publish Event
              </button>
            )}
          </nav>

          {/* Right Actions: Role Switcher, Notification Bell, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Role Switcher Pill */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
                <button
                  onClick={() => {
                    switchRole('student');
                    setCurrentTab('home');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    role === 'student'
                      ? 'bg-white text-primary-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Switch to Student view"
                >
                  <span>🎓</span>
                  <span>Student</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('organiser');
                    setCurrentTab('organiser-dashboard');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    role === 'organiser'
                      ? 'bg-white text-primary-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Switch to Organiser view"
                >
                  <span>🏛️</span>
                  <span>Organiser</span>
                </button>
              </div>
            )}

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowProfileDropdown(false);
                  }}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-4 z-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={handleMarkAllRead}
                          className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">
                          No notifications right now
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id}
                            className={`py-2.5 px-2 rounded-xl transition-all ${
                              n.read ? 'opacity-70 hover:bg-slate-50' : 'bg-primary-50/50 hover:bg-primary-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                {n.type === 'reminder' && '🔔'}
                                {n.type === 'confirmation' && '🎟️'}
                                {n.type === 'alert' && '⚠️'}
                                {n.type === 'update' && '📢'}
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Simulation button for demo reviewer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={handleTriggerSimulatedReminder}
                        className="text-[11px] font-medium text-slate-600 hover:text-primary-600 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                        Simulate Event Alert
                      </button>
                      <button
                        onClick={() => setShowNotifDropdown(false)}
                        className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Pill or Login CTA */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowNotifDropdown(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition-all"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300"
                  />
                  <div className="text-left hidden lg:block leading-tight">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-primary-600 font-semibold uppercase tracking-wider">
                      {role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-3 z-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-800">
                        {role === 'student' ? '🎓 Student Mode' : '🏛️ Organiser Mode'}
                      </div>
                      {user?.department && (
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          Dept: {user.department}
                        </p>
                      )}
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          switchRole(role === 'student' ? 'organiser' : 'student');
                          setShowProfileDropdown(false);
                          setCurrentTab(role === 'student' ? 'organiser-dashboard' : 'home');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                      >
                        <span>Switch to {role === 'student' ? 'Organiser' : 'Student'}</span>
                        <Layers className="w-3.5 h-3.5 text-primary-600" />
                      </button>

                      <button
                        onClick={handleResetDemoData}
                        disabled={isResetting}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                      >
                        <span>Reset Demo Data</span>
                        <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3.5 py-1.5 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 text-xs font-medium">
            <span className="text-slate-600">Active View:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  switchRole('student');
                  setCurrentTab('home');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg font-bold ${
                  role === 'student' ? 'bg-white text-primary-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                🎓 Student
              </button>
              <button
                onClick={() => {
                  switchRole('organiser');
                  setCurrentTab('organiser-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg font-bold ${
                  role === 'organiser' ? 'bg-white text-primary-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                🏛️ Organiser
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentTab('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                currentTab === 'home' ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Events
            </button>

            {role === 'student' && (
              <button
                onClick={() => {
                  setCurrentTab('my-events');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  currentTab === 'my-events' ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Events
              </button>
            )}

            {role === 'organiser' && (
              <button
                onClick={() => {
                  setCurrentTab('organiser-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  currentTab === 'organiser-dashboard' ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Organiser Portal
              </button>
            )}

            {role === 'organiser' && onOpenCreateEvent && (
              <button
                onClick={() => {
                  onOpenCreateEvent();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-primary-600 text-white shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Publish Event
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
