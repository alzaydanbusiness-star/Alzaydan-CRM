import React from 'react';
import { Layers } from 'lucide-react';

export default function CommercialPipelineBar({
  stagesData,
  onViewFullPipeline
}) {
  const stages = stagesData || [
    {
      name: 'Opportunity',
      count: 0,
      value: 'AED 0',
      prob: '30%',
      wtd: 'AED 0',
      barColor: 'bg-[#00277F]'
    },
    {
      name: 'Quotation',
      count: 0,
      value: 'AED 0',
      prob: '60%',
      wtd: 'AED 0',
      barColor: 'bg-[#00277F]'
    },
    {
      name: 'Order',
      count: 0,
      value: 'AED 0',
      prob: '80%',
      wtd: 'AED 0',
      barColor: 'bg-[#00277F]'
    },
    {
      name: 'Invoice',
      count: 0,
      value: 'AED 0',
      prob: '95%',
      wtd: 'AED 0',
      barColor: 'bg-[#00277F]'
    },
    {
      name: 'Receipt',
      count: 0,
      value: 'AED 0',
      prob: '100%',
      wtd: 'AED 0',
      barColor: 'bg-[#00277F]'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      {/* Top Header Matching Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#011635]" />
            <h3 className="text-xs sm:text-sm font-extrabold text-[#011635] uppercase tracking-wide">
              Commercial Sales Pipeline by Stage
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage distribution, total value, and conversion probability for active deal lifecycle
          </p>
        </div>

        <button
          type="button"
          onClick={onViewFullPipeline}
          className="flex items-center gap-1 text-xs font-bold text-[#011635] hover:underline self-start sm:self-center transition-colors cursor-pointer"
        >
          <span>View Full Pipeline &rarr;</span>
        </button>
      </div>

      {/* 6 Stage Horizontal Grid Matching Exact Reference */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stg, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2.5 flex flex-col justify-between"
          >
            {/* Stage Name & Count Pill */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-slate-700 truncate">
                {stg.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-200 bg-slate-50/70 font-mono">
                {stg.count}
              </span>
            </div>

            {/* Deal Value */}
            <div className="text-base font-extrabold text-slate-900 tracking-tight">
              {stg.value}
            </div>

            {/* Probability & Weighted Value */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[10px] font-medium">
                <span className="text-slate-400">Prob: {stg.prob}</span>
                <span className="text-[#00277F] font-bold">Wtd: {stg.wtd}</span>
              </div>

              {/* Progress Bar with Exact Fill Percentage */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${stg.barColor} transition-all duration-300`}
                  style={{ width: stg.prob }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
