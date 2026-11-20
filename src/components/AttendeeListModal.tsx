import React, { useState, useEffect } from 'react';
import { X, Users, Download, Search, CheckCircle2, Mail, Building, Ticket } from 'lucide-react';
import { api } from '../services/api';
import { Registration } from '../types';

interface AttendeeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  eventTitle: string;
}

export const AttendeeListModal: React.FC<AttendeeListModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle
}) => {
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true);
      api.getEventAttendees(eventId)
        .then(data => {
          setAttendees(data.attendees || []);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, eventId]);

  if (!isOpen || !eventId) return null;

  const filteredAttendees = attendees.filter(a => 
    a.userName.toLowerCase().includes(search.toLowerCase()) ||
    a.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    (a.ticketCode && a.ticketCode.toLowerCase().includes(search.toLowerCase())) ||
    (a.userDepartment && a.userDepartment.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    const headers = ['Ticket Code', 'Name', 'Email', 'Department', 'Status', 'Registered At'];
    const rows = attendees.map(a => [
      a.ticketCode,
      `"${a.userName}"`,
      a.userEmail,
      `"${a.userDepartment || ''}"`,
      a.status,
      a.registeredAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Registered Attendees
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                {attendees.length} Confirmed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">
              Event: <strong className="text-slate-800">{eventTitle}</strong>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Export */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or ticket #..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            disabled={attendees.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Attendees Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Loading attendee list...
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              {attendees.length === 0 ? 'No students registered for this event yet.' : 'No attendees matching your search.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAttendees.map(attendee => (
                <div key={attendee.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {attendee.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{attendee.userName}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{attendee.userEmail}</span>
                        </span>
                        <span>•</span>
                        <span>{attendee.userDepartment || 'Student'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                      {attendee.ticketCode}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(attendee.registeredAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
