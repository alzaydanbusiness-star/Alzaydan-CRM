import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  Clock,
  Building,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function CallQueue({ calls, onCompleteCall }) {
  const [activeLoggingCall, setActiveLoggingCall] = useState(null);
  const [callNotes, setCallNotes] = useState('');

  const handleStartCall = (call) => {
    toast.info(`Dialing ${call.contact} (${call.company}) at ${call.phone}...`);
    setActiveLoggingCall(call);
    setCallNotes('');
  };

  const handleSaveCallNotes = (e) => {
    e.preventDefault();
    if (!callNotes.trim()) {
      toast.error('Please enter call outcome notes');
      return;
    }

    onCompleteCall(activeLoggingCall.id, callNotes);
    toast.success(`Call logged for ${activeLoggingCall.company}`);
    setActiveLoggingCall(null);
    setCallNotes('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-[#063056]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Today's Outreach & Client Call Schedule
            </h3>
            <p className="text-xs text-slate-500">
              High-value client follow-ups, contract reviews, and executive demos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Today's Target: 5 Calls
          </span>
        </div>
      </div>

      {/* Calls List */}
      <div className="divide-y divide-slate-100">
        {calls.map((call) => {
          const isCompleted = call.status === 'completed';

          return (
            <div
              key={call.id}
              className={`p-4 sm:p-5 transition-colors ${
                isCompleted ? 'bg-slate-50/50' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Time + Company + Purpose */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="flex flex-col items-center justify-center w-16 h-14 rounded-xl bg-slate-100/90 border border-slate-200 shrink-0 text-center">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      {call.time}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-[#063056]" />
                        {call.company}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        • {call.contact}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {call.dealValue}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-1">
                      <span className="font-medium text-slate-500">Objective: </span>
                      {call.purpose}
                    </p>

                    {isCompleted && call.outcome && (
                      <div className="mt-2 text-xs bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 text-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Logged Outcome: </span>
                          <span>{call.outcome}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 sm:self-center">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100/70 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStartCall(call)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#063056] text-white hover:bg-[#083E6E] shadow-2xs transition-all"
                    >
                      <PhoneForwarded className="w-3.5 h-3.5" />
                      <span>Call & Log</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Call Modal */}
      {activeLoggingCall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#063056]" />
                <h3 className="font-bold text-base text-slate-900">
                  Log Call with {activeLoggingCall.contact}
                </h3>
              </div>
              <button
                onClick={() => setActiveLoggingCall(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
              <div className="font-bold text-slate-800">{activeLoggingCall.company}</div>
              <div className="text-slate-500">{activeLoggingCall.phone}</div>
              <div className="text-emerald-700 font-bold mt-1">{activeLoggingCall.dealValue}</div>
            </div>

            <form onSubmit={handleSaveCallNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Call Outcome & Next Steps
                </label>
                <textarea
                  rows={4}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="e.g. Client agreed on SLA terms. Sending final revision tonight..."
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#063056] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLoggingCall(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#063056] text-white hover:bg-[#083E6E]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Outcome</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

