import React from 'react';
import {
  Activity,
  UserPlus,
  Target,
  FileText,
  UserCheck
} from 'lucide-react';

export default function RecentActivities({ activities, onViewAll }) {
  const getActivityIcon = (iconType) => {
    switch (iconType) {
      case 'user-plus':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'target':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'quote':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'user-check':
      default:
        return <UserCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#063056]" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recent Activities
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#1D4ED8] hover:text-blue-800 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Feed List */}
      <div className="space-y-3.5">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-full ${act.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                {getActivityIcon(act.iconType)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {act.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {act.desc}
                </div>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-medium shrink-0">
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
