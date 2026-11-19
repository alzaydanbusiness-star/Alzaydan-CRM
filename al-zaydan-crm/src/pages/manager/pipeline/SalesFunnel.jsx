import React, { useState } from 'react';
import {
  Filter,
  TrendingDown,
  Layers,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { pipelineStages } from '../data/mockData';

export default function SalesFunnel() {
  const [activeStage, setActiveStage] = useState(pipelineStages[0].id);

  const selectedStageData = pipelineStages.find(s => s.id === activeStage) || pipelineStages[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#063056]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Division Sales Pipeline & Conversion Funnel
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stage-by-stage velocity across Team 1 (Alpha), Team 2 (Beta), and Team 3 (Gamma)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <Layers className="w-3.5 h-3.5 text-[#063056]" />
          <span>Total Pipeline: $4,890,000 across 324 leads</span>
        </div>
      </div>

      {/* Visual Funnel Cards / Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {pipelineStages.map((stage, idx) => {
          const isSelected = activeStage === stage.id;
          return (
            <div
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-50/50 border-[#063056] shadow-sm ring-1 ring-[#063056]'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200'
              }`}
            >
              {/* Funnel Level Indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Stage {idx + 1}
                </span>
                <span className="text-xs font-black text-[#063056]">
                  {stage.percentage}%
                </span>
              </div>

              {/* Stage Name */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {stage.name}
                </div>
                <div className="text-sm font-black text-slate-900">
                  {stage.value}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {stage.count} deals active
                </div>
              </div>

              {/* Visual Width Bar */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#063056] transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Detail Callout */}
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#063056] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Selected Stage: {selectedStageData.name}
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {selectedStageData.count} Deals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Accumulated value at this stage is <strong className="text-slate-800">{selectedStageData.value}</strong>. 
              Average cycle time at this stage: <strong>4.8 business days</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 sm:border-l sm:border-slate-200 sm:pl-5 shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Conversion to Next</div>
            <div className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>71.2%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Drop-off Rate</div>
            <div className="text-sm font-extrabold text-rose-600 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>28.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
