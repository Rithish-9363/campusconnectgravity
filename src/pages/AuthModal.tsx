import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User as UserIcon, Building, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, signup, demoLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(authModalMode === 'login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [interestsInput, setInterestsInput] = useState('Technology, Hackathons, AI');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const interests = interestsInput.split(',').map(s => s.trim()).filter(Boolean);
        await signup({
          name,
          email,
          password,
          role,
          department,
          interests
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: Role) => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await demoLogin(demoRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white relative">
          <button 
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span>CampusConnect Auth</span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            {isLogin ? 'Welcome Back!' : 'Join CampusConnect'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isLogin 
              ? 'Discover campus events and manage registrations.' 
              : 'Sign up to register for events or publish as an organiser.'}
          </p>
        </div>

        {/* Quick 1-Click Demo Buttons */}
        <div className="p-4 bg-primary-50/70 border-b border-primary-100/80">
          <p className="text-[11px] font-bold text-primary-900 uppercase tracking-wider mb-2 text-center">
            ⚡ Instant Reviewer 1-Click Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('student')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold bg-white hover:bg-primary-100 text-primary-800 border border-primary-200 shadow-2xs transition-all"
            >
              <span>🎓</span>
              <span>Student Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('organiser')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold bg-white hover:bg-primary-100 text-primary-800 border border-primary-200 shadow-2xs transition-all"
            >
              <span>🏛️</span>
              <span>Organiser Demo</span>
            </button>
          </div>
        </div>

        {/* Tab switcher: Login vs Signup */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-all ${
              isLogin 
                ? 'bg-white text-primary-600 border-b-2 border-primary-600' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition-all ${
              !isLogin 
                ? 'bg-white text-primary-600 border-b-2 border-primary-600' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Campus Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'student'
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organiser')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'organiser'
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🏛️ Organiser
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / School
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science, Arts, Business"
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interests (for AI recommendations)
                  </label>
                  <input
                    type="text"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder="e.g. AI, Music, Sports, Hackathons"
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Processing...' : isLogin ? 'Sign In to Dashboard' : 'Create Campus Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Demo data only • Safe campus environment
        </div>

      </div>
    </div>
  );
};
