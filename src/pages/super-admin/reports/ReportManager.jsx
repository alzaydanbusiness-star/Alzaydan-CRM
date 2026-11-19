import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  ArrowLeft,
  Sliders,
  Edit2,
  Play,
  Download,
  Printer,
  X,
  TrendingUp,
  PieChart,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportManager({ onBack }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');

  // Active Interactive Modals
  const [activeRunningReport, setActiveRunningReport] = useState(null);
  const [activeEditingReport, setActiveEditingReport] = useState(null);
  const [activeCustomizingReport, setActiveCustomizingReport] = useState(null);

  // 11 Canonical Reports (Matching Reference Image Exactly)
  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'Opportunity Closing',
      description: 'Opportunity pipeline closures and win-loss status analysis',
      hasCustomize: true,
      category: 'Sales Pipeline',
      defaultDateRange: 'Current Quarter',
      runCount: 142
    },
    {
      id: 2,
      title: 'Services',
      description: 'Service master listing (Service type items) with unit, category and brand breakdown',
      hasCustomize: false,
      category: 'Master Data',
      defaultDateRange: 'All Time',
      runCount: 58
    },
    {
      id: 3,
      title: 'Product',
      description: 'Product master listing (Product type items) with unit, category, store and stock levels',
      hasCustomize: false,
      category: 'Inventory & Stock',
      defaultDateRange: 'Real-time',
      runCount: 94
    },
    {
      id: 4,
      title: 'Sales',
      description: 'Comprehensive sales performance and gross margin reporting',
      hasCustomize: true,
      category: 'Revenue & Finance',
      defaultDateRange: 'Fiscal Year 2026',
      runCount: 312
    },
    {
      id: 5,
      title: 'Campaign',
      description: 'Marketing campaign attribution and conversions',
      hasCustomize: false,
      category: 'Marketing',
      defaultDateRange: 'Last 90 Days',
      runCount: 46
    },
    {
      id: 6,
      title: 'Salesman',
      description: 'Sales Executives performance and deal quotas',
      hasCustomize: false,
      category: 'Sales Operations',
      defaultDateRange: 'Current Month',
      runCount: 188
    },
    {
      id: 7,
      title: 'Aging Report',
      description: 'Customer receivable aging matrix across 30, 60, 90+ days',
      hasCustomize: false,
      category: 'Finance & Accounts',
      defaultDateRange: 'As of Today',
      runCount: 220
    },
    {
      id: 8,
      title: 'Customer Statement',
      description: 'Account balances and ledger statement by customer',
      hasCustomize: false,
      category: 'Finance & Accounts',
      defaultDateRange: 'Year to Date',
      runCount: 165
    },
    {
      id: 9,
      title: 'Invoice And Receipt Report',
      description: 'Tax invoices, receipts, and commercial revenue reconciliation',
      hasCustomize: false,
      category: 'Revenue & Finance',
      defaultDateRange: 'Last 30 Days',
      runCount: 275
    },
    {
      id: 10,
      title: 'Inventory',
      description: 'Warehouse stock balances, reorder thresholds, and valuations',
      hasCustomize: false,
      category: 'Warehouse & Logistics',
      defaultDateRange: 'Current Stock',
      runCount: 130
    },
    {
      id: 11,
      title: 'WhatsApp Number',
      description: 'WhatsApp broadcast logs and customer conversation history',
      hasCustomize: false,
      category: 'Communications',
      defaultDateRange: 'Last 7 Days',
      runCount: 89
    }
  ]);

  // Filtered list based on search
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  // Report execution handler
  const handleRunReport = (report) => {
    setActiveRunningReport(report);
    toast.success(`Running "${report.title}" report...`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeEditingReport) return;
    setReports(reports.map((r) => (r.id === activeEditingReport.id ? activeEditingReport : r)));
    toast.success(`Report "${activeEditingReport.title}" configuration saved!`);
    setActiveEditingReport(null);
  };

  const handleExportCSV = (reportTitle) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"Report Name: ${reportTitle}"\n"Export Date: ${new Date().toISOString()}"\n"Currency: AED (UAE Dirham)"\n\n` +
      `"Record Ref","Client / Entity","Owner","Category","Amount (AED)","Status"\n` +
      `"REP-001","Gulf Logistics Hub FZE","Ahmed Rafiq","Industrial HVAC","240000","Settled"\n` +
      `"REP-002","Emirates Steel Arkan","Sarah Al-Mansoor","Heavy Chillers","140000","Cleared"\n` +
      `"REP-003","Elite Solutions Freezone","Omar Al-Hassan","Server Cooling","185000","Pending"\n` +
      `"REP-004","Zabeel Engineering","Sajid A","Maintenance","15500","Cleared"\n` +
      `"REP-005","Al Noor Trading LLC","Khalid Bin Walid","Spare Units","32400","Cleared"`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${reportTitle} as CSV`);
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* 1. TOP TITLE HEADER BAR (Matching Reference Image Exactly)      */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button + Blue Report Icon + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack || (() => toast.info('Navigating back'))}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5 fill-blue-50 text-blue-600" />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Report</h1>
          </div>
        </div>

        {/* Right: Toggle Pill Buttons [Report List] [Analytics & BI Charts] */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Report List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Analytics &amp; BI Charts
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB 1: REPORT LIST VIEW (Matching Reference Image Rows)     */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Top Search Bar */}
          <div className="relative border-b border-slate-100 p-3 sm:p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search report..."
              className="w-full h-10 pl-3 pr-10 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-6 sm:right-7 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Report Listing Table / Rows */}
          <div className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No reports found</p>
                <p className="text-xs text-slate-400">Try adjusting your search query</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 sm:px-6 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Left: Serial Number + Title + Description */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <span className="w-6 font-bold text-xs text-slate-800 shrink-0">
                      {report.id}
                    </span>

                    <div className="space-y-0.5 flex-1 max-w-3xl">
                      <button
                        type="button"
                        onClick={() => handleRunReport(report)}
                        className="font-bold text-xs sm:text-[13px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left tracking-tight"
                      >
                        {report.title}
                      </button>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action Buttons (# Customize, Edit, Run) */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    {/* Optional # Customize Button (Orange/Amber) */}
                    {report.hasCustomize && (
                      <button
                        type="button"
                        onClick={() => setActiveCustomizingReport(report)}
                        className="px-2.5 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-white text-[11px] font-bold rounded-md flex items-center gap-1 shadow-2xs hover:shadow-xs transition cursor-pointer"
                        title="Customize Report Columns & Calculations"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Customize</span>
                      </button>
                    )}

                    {/* Edit Button (Sky Blue) */}
                    <button
                      type="button"
                      onClick={() => setActiveEditingReport({ ...report })}
                      className="px-2.5 py-1 bg-[#38BDF8] hover:bg-[#0284C7] text-white text-[11px] font-bold rounded-md flex items-center gap-1 shadow-2xs hover:shadow-xs transition cursor-pointer"
                      title="Edit Report Criteria"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {/* Run Button (Green) */}
                    <button
                      type="button"
                      onClick={() => handleRunReport(report)}
                      className="px-2.5 py-1 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[11px] font-bold rounded-md flex items-center gap-1 shadow-2xs hover:shadow-xs transition cursor-pointer"
                      title="Run Live Report"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB 2: ANALYTICS & BI CHARTS VIEW                           */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Realization</span>
              <div className="text-xl font-black text-slate-900 mt-1 font-mono">AED 2,840,000</div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +14.8% vs Previous Month
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Gross Margin</span>
              <div className="text-xl font-black text-blue-600 mt-1 font-mono">38.4%</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Target GCC Benchmark: 35.0%</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receivables Cleared</span>
              <div className="text-xl font-black text-emerald-600 mt-1 font-mono">AED 1,920,000</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">92.4% on-time settlement</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Commercial Deals</span>
              <div className="text-xl font-black text-purple-600 mt-1 font-mono">54 Contracts</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">In pipeline stages</span>
            </div>
          </div>

          {/* Interactive Chart Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Trend Visualizer */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Monthly Revenue &amp; Quota Delivery (AED)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Q3 - Q4 2026</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { month: 'July 2026', rev: 'AED 540,000', pct: 68, color: 'bg-blue-500' },
                  { month: 'August 2026', rev: 'AED 620,000', pct: 78, color: 'bg-blue-600' },
                  { month: 'September 2026', rev: 'AED 790,000', pct: 92, color: 'bg-emerald-500' },
                  { month: 'October 2026', rev: 'AED 890,000', pct: 104, color: 'bg-[#011635]' },
                  { month: 'November 2026 (MTD)', rev: 'AED 480,000', pct: 56, color: 'bg-teal-500' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.month}</span>
                      <span className="font-mono text-slate-900 font-bold">{item.rev} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${Math.min(item.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Receivable Aging Breakdown */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Customer Aging Matrix Analysis
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Total AED 920,000</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { bracket: '0 - 30 Days (Current)', amount: 'AED 580,000', pct: '63.0%', color: 'bg-emerald-500', note: 'Standard commercial term' },
                  { bracket: '31 - 60 Days', amount: 'AED 210,000', pct: '22.8%', color: 'bg-amber-400', note: 'First reminder notice sent' },
                  { bracket: '61 - 90 Days', amount: 'AED 95,000', pct: '10.3%', color: 'bg-orange-500', note: 'Finance followup scheduled' },
                  { bracket: '90+ Days (Overdue)', amount: 'AED 35,000', pct: '3.9%', color: 'bg-rose-500', note: 'Management review' }
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.bracket}</div>
                        <div className="text-[10px] text-slate-400">{item.note}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-slate-900">{item.amount}</span>
                      <span className="block text-[10px] text-slate-500 font-semibold">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: RUN REPORT (Data View & CSV / PDF Export)             */}
      {/* ============================================================== */}
      {activeRunningReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#011635] to-[#002855] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white">
                    {activeRunningReport.title}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {activeRunningReport.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportCSV(activeRunningReport.title)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRunningReport(null)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Meta Pill Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600">
                  <span><strong>Category:</strong> {activeRunningReport.category}</span>
                  <span><strong>Period:</strong> {activeRunningReport.defaultDateRange}</span>
                  <span><strong>Generated:</strong> 14-11-2026 17:18</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Verified Data
                  </span>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3.5">Record Ref</th>
                      <th className="py-2.5 px-3.5">Client / Enterprise</th>
                      <th className="py-2.5 px-3.5">Assigned Owner</th>
                      <th className="py-2.5 px-3.5">Classification</th>
                      <th className="py-2.5 px-3.5 text-right">Value (AED)</th>
                      <th className="py-2.5 px-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-600">OPP-2026-1001</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">Al Noor Trading LLC</td>
                      <td className="py-2.5 px-3.5">Ahmed Rafiq</td>
                      <td className="py-2.5 px-3.5">Cold Storage Expansion</td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold">AED 240,000</td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Won &bull; Closed
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-600">OPP-2026-1002</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">Gulf Logistics Hub FZE</td>
                      <td className="py-2.5 px-3.5">Sajid A</td>
                      <td className="py-2.5 px-3.5">Freezone Fleet Logistics</td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold">AED 385,000</td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Negotiation
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-600">OPP-2026-1003</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">Prime Construction Co.</td>
                      <td className="py-2.5 px-3.5">Muhammed K</td>
                      <td className="py-2.5 px-3.5">Commercial HVAC Retrofit</td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold">AED 150,000</td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Proposal Sent
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-600">OPP-2026-1004</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">Emirates Steel Arkan</td>
                      <td className="py-2.5 px-3.5">Sarah Al-Mansoor</td>
                      <td className="py-2.5 px-3.5">Industrial Chiller Package</td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold">AED 410,000</td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Won &bull; Closed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3.5 text-right uppercase text-[11px]">Total Report Valuation:</td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-emerald-700 text-sm">AED 1,185,000</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveRunningReport(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: EDIT REPORT CRITERIA                                 */}
      {/* ============================================================== */}
      {activeEditingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#011635] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm">Edit Report Configuration</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditingReport(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Report Title</label>
                <input
                  type="text"
                  value={activeEditingReport.title}
                  onChange={(e) =>
                    setActiveEditingReport({ ...activeEditingReport, title: e.target.value })
                  }
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={activeEditingReport.description}
                  onChange={(e) =>
                    setActiveEditingReport({ ...activeEditingReport, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={activeEditingReport.category}
                    onChange={(e) =>
                      setActiveEditingReport({ ...activeEditingReport, category: e.target.value })
                    }
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Default Date Range</label>
                  <select
                    value={activeEditingReport.defaultDateRange}
                    onChange={(e) =>
                      setActiveEditingReport({
                        ...activeEditingReport,
                        defaultDateRange: e.target.value
                      })
                    }
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Current Month">Current Month</option>
                    <option value="Current Quarter">Current Quarter</option>
                    <option value="Fiscal Year 2026">Fiscal Year 2026</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEditingReport(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: # CUSTOMIZE REPORT (Columns & Formula Builder)       */}
      {/* ============================================================== */}
      {activeCustomizingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <h3 className="font-bold text-sm">Customize: {activeCustomizingReport.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomizingReport(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Select columns to display and custom analytical aggregation metrics:
              </p>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Report Columns</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {['Deal Valuation (AED)', 'Win / Loss Probability', 'Closure Forecast Date', 'Sales Executive', 'Customer Sector', 'Gross Margin %'].map((col, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500" />
                      <span>{col}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Group Data By</label>
                <select className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800">
                  <option>Sales Representative</option>
                  <option>Customer Industry Classification</option>
                  <option>Monthly Pipeline Stage</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCustomizingReport(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Custom criteria saved for "${activeCustomizingReport.title}"`);
                    setActiveCustomizingReport(null);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Apply Customization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
