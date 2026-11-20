import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  ShieldCheck, 
  Share2, 
  AlertTriangle 
} from 'lucide-react';
import QRCode from 'qrcode';
import { CampusEvent, Registration } from '../types';

interface TicketPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
  registrationDetails?: Registration | null;
  onCancelRegistration?: (eventId: string) => Promise<void>;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  isOpen,
  onClose,
  event,
  registrationDetails,
  onCancelRegistration
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      const ticketCode = registrationDetails?.ticketCode || `CC-${event.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrPayload = JSON.stringify({
        ticket: ticketCode,
        event: event.title,
        date: event.date,
        user: registrationDetails?.userName || 'Student Attendee',
        verified: true,
        issuedBy: 'CampusConnect 2026'
      });

      QRCode.toDataURL(qrPayload, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('QR generation error:', err);
      });
    }
  }, [event, isOpen, registrationDetails]);

  if (!isOpen || !event) return null;

  const ticketId = registrationDetails?.ticketCode || 'CC-PASS-2026';
  const attendeeName = registrationDetails?.userName || 'Alex Rivera';
  const attendeeDept = registrationDetails?.userDepartment || 'Computer Science & AI';

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${event.title}"? Your seat will be made available to other students.`)) {
      return;
    }
    if (onCancelRegistration) {
      setIsCancelling(true);
      try {
        await onCancelRegistration(event.id);
        onClose();
      } catch (err: any) {
        alert(err.message || 'Failed to cancel registration');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">CampusConnect Digital Pass</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all no-print"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 bg-slate-50 printable-ticket">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            
            {/* Top Ticket Header Banner */}
            <div className="relative h-24 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 p-4 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                  Official Admission Pass
                </span>
                <span className="text-xs font-mono font-bold bg-black/30 px-2 py-0.5 rounded-md">
                  {ticketId}
                </span>
              </div>
              <p className="text-sm font-extrabold truncate drop-shadow-xs">
                {event.title}
              </p>
            </div>

            {/* Perforated Divider */}
            <div className="relative flex items-center justify-between px-4 py-2 border-b border-dashed border-slate-300 bg-white">
              <div className="absolute -left-3 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200 shadow-inner" />
              <div className="absolute -right-3 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200 shadow-inner" />
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mx-auto">
                Scan at gate entrance
              </span>
            </div>

            {/* Ticket Body with QR & Details */}
            <div className="p-5 space-y-4">
              
              {/* QR Code Center */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Ticket QR" className="w-36 h-36 rounded-lg mix-blend-multiply" />
                ) : (
                  <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg" />
                )}
                <span className="text-[11px] font-mono font-bold text-slate-700 mt-2">
                  PASS CODE: {ticketId}
                </span>
              </div>

              {/* Event Schedule Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Date & Time
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
                    {event.time}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Venue
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Category: {event.category}
                  </span>
                </div>
              </div>

              {/* Attendee Info */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                    Registered Attendee
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {attendeeName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {attendeeDept}
                  </p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                  <span>Confirmed</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2 no-print">
          
          {/* Cancel Registration Option */}
          {onCancelRegistration && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
            >
              {isCancelling ? 'Releasing...' : 'Cancel Registration'}
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-xs"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
