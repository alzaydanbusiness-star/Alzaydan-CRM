import React from 'react';
import {
  Target,
  Briefcase,
  Award,
  TrendingUp,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { repProfile, summaryMetrics } from '../data/mockData';

export default function SummaryCards({ dealsCount = 6 }) {
  const getCardIcon = (id) => {
    switch (id) {
      case 'quota-progress':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'active-pipeline':
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'earned-commission':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'win-rate':
        return <Percent className="w-5 h-5 text-amber-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryMetrics.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">
                {item.title}
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {getCardIcon(item.id)}
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {item.value}
            </div>

            <div className="text-xs text-slate-500 mt-1 font-medium">
              {item.id === 'active-pipeline'
                ? `${dealsCount} active opportunities`
                : item.subtitle}
            </div>

            {/* Quota Progress Bar for First Card */}
            {item.progress && (
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500 font-medium">Quota Pace</span>
                  <span className="font-bold text-blue-700">{repProfile.quotaProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${repProfile.quotaProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>AED 80k to 100% bonus</span>
                  <span className="font-semibold text-emerald-600">On Track</span>
                </div>
              </div>
            )}
          </div>

          {!item.progress && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">{item.change}</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

