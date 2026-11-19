import React, { useState } from 'react';
import {
  Activity,
  FileText,
  Users,
  Trophy,
  ShieldAlert,
  Phone,
  Calendar,
  Send,
  Search,
  CheckCircle,
  UserCheck,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamLeadActivities({
  activities,
  teams,
  selectedLead,
  onSelectLead,
  onAddActivity
}) {
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [targetLeadForNote, setTargetLeadForNote] = useState('');

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    // Lead filter
    if (selectedLead && selectedLead !== 'All') {
      if (act.leadName.toLowerCase() !== selectedLead.toLowerCase()) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== 'All') {
      if (act.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${act.leadName} ${act.teamName} ${act.title} ${act.description} ${act.client || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  const handleSendDirective = (e) => {
    e.preventDefault();
    if (!quickNote.trim()) {
      toast.error('Please enter a note or directive for the Team Lead');
      return;
    }

    const leadToTarget = targetLeadForNote || (selectedLead && selectedLead !== 'All' ? selectedLead : teams[0]?.lead || 'Team Leads');

    const newDirective = {
      id: `act-dir-${Date.now()}`,
      leadName: leadToTarget,
      leadEmail: teams.find(t => t.lead === leadToTarget)?.leadEmail || 'lead@alzaydan.com',
      teamName: teams.find(t => t.lead === leadToTarget)?.name || 'Sales Division',
      type: 'directive',
      title: 'Manager Priority Directive',
      description: quickNote.trim(),
      timestamp: 'Just now',
      client: 'Internal Directive'
    };

    onAddActivity(newDirective);
    toast.success(`Priority directive dispatched to ${leadToTarget}`);
    setQuickNote('');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'proposal':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'deal_won':
        return <Trophy className="w-4 h-4 text-emerald-600" />;
      case 'approval':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'call':
        return <Phone className="w-4 h-4 text-violet-600" />;
      case 'assignment':
        return <UserCheck className="w-4 h-4 text-sky-600" />;
      case 'demo':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'directive':
        return <Send className="w-4 h-4 text-rose-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityBadgeColor = (type) => {
    switch (type) {
      case 'proposal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'meeting':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'deal_won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'approval':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'call':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'assignment':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'demo':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'directive':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-linear-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Team Lead Live Activities
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {filteredActivities.length} Activities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational visibility into quotations, client meetings, deal closures, and team lead directives.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team Lead Selector */}
          <div className="relative">
            <select
              value={selectedLead || 'All'}
              onChange={(e) => onSelectLead(e.target.value)}
              className="text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#063056] cursor-pointer"
            >
              <option value="All">All Team Leads</option>
              {teams.map((t) => (
                <option key={t.id} value={t.lead}>
                  {t.lead} ({t.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type Selector */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#063056] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="proposal">Quotations & Proposals</option>
              <option value="deal_won">Deals Closed Won</option>
              <option value="meeting">Client Meetings</option>
              <option value="approval">Approvals Submitted</option>
              <option value="assignment">Leads Distributed</option>
              <option value="call">Calls Logged</option>
              <option value="directive">Manager Directives</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client, deal..."
              className="text-xs py-2 pl-8 pr-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#063056] w-36 sm:w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Quick Send Manager Directive Banner */}
      <div className="p-4 bg-blue-50/40 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#063056] shrink-0">
          <Send className="w-3.5 h-3.5 text-[#063056]" />
          <span>Dispatch Manager Directive:</span>
        </div>
        <form onSubmit={handleSendDirective} className="flex-1 w-full flex items-center gap-2">
          <select
            value={targetLeadForNote || (selectedLead && selectedLead !== 'All' ? selectedLead : '')}
            onChange={(e) => setTargetLeadForNote(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#063056]"
          >
            <option value="">Select Team Lead</option>
            {teams.map((t) => (
              <option key={t.id} value={t.lead}>{t.lead}</option>
            ))}
          </select>
          <input
            type="text"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Type priority instruction or target update to Team Lead..."
            className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#063056]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-[#063056] hover:bg-[#094173] text-white text-xs font-bold transition cursor-pointer shrink-0"
          >
            Post
          </button>
        </form>
      </div>

      {/* Activities Timeline List */}
      <div className="p-5 divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto" />
            <p className="font-semibold text-slate-600">No activities found</p>
            <p className="text-xs text-slate-400">
              {selectedLead !== 'All'
                ? `No recorded activities for ${selectedLead} under the selected filters.`
                : 'No activities match your query.'}
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div key={act.id} className="py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/50 px-2 rounded-xl transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Activity Icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/70">
                    {getActivityIcon(act.type)}
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {act.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActivityBadgeColor(act.type)}`}>
                        {act.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {act.dealValue && (
                        <span className="font-black text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {act.dealValue}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="font-bold text-slate-700">
                        👤 {act.leadName}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-medium text-slate-600">
                        {act.teamName}
                      </span>
                      {act.client && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-medium">
                            🏢 {act.client}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{act.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
