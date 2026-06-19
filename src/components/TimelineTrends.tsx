import React, { useState, useEffect } from "react";
import { Contact, StatusType } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  Activity,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TimelineTrendsProps {
  contacts: Contact[];
}

export const TimelineTrends: React.FC<TimelineTrendsProps> = ({ contacts }) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(3); // 0 = June 1, 1 = June 8, 2 = June 15, 3 = Today
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredStatus, setHoveredStatus] = useState<StatusType | null>(null);

  const weeks = [
    {
      id: 0,
      date: "June 1, 2026",
      label: "Initial Upload",
      details: "CRM database imported. All 100 community records initialized on clean slate.",
      // Simulated stats
      stats: {
        "New": 100,
        "Attempted Contact": 0,
        "In Discussion": 0,
        "Connected": 0,
        "Follow-up Needed": 0,
        "Not Interested": 0,
      }
    },
    {
      id: 1,
      date: "June 8, 2026",
      label: "Cold Outreach Initiated",
      details: "Coordinators dispatched tailored informational mailers and templates to counselor cohorts.",
      stats: {
        "New": 55,
        "Attempted Contact": 35,
        "In Discussion": 10,
        "Connected": 0,
        "Follow-up Needed": 0,
        "Not Interested": 0,
      }
    },
    {
      id: 2,
      date: "June 15, 2026",
      label: "Discussion Peak",
      details: "Several high school and community therapists engaged in active diagnostic reviews.",
      stats: {
        "New": 22,
        "Attempted Contact": 20,
        "In Discussion": 32,
        "Connected": 18,
        "Follow-up Needed": 8,
        "Not Interested": 0,
      }
    },
    {
      id: 3,
      date: "June 19, 2026 (Today)",
      label: "Active Database Reset",
      details: "Current live database state. All claimant statuses set to 'New' as no active contacts have started.",
      stats: {
        "New": contacts.length, // Match live database
        "Attempted Contact": 0,
        "In Discussion": 0,
        "Connected": 0,
        "Follow-up Needed": 0,
        "Not Interested": 0,
      }
    }
  ];

  const currentWeekData = weeks[selectedWeek];

  // Auto-playing logic across the weeks
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedWeek((prev) => {
          if (prev >= 3) {
            return 0; // Loop back
          }
          return prev + 1;
        });
      }, 3000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeStats = currentWeekData.stats;
  const totalInWeek = Object.values(activeStats).reduce((sum, val) => sum + val, 0);

  // Status lists
  const statusTypes: StatusType[] = [
    "New",
    "Attempted Contact",
    "In Discussion",
    "Connected",
    "Follow-up Needed",
    "Not Interested"
  ];

  // Hex color pairings matching editorial theme
  const getStatusColor = (status: StatusType, styleType: "bar" | "text" | "bg") => {
    switch (status) {
      case "New":
        return styleType === "bar" ? "bg-editorial-ink" : styleType === "text" ? "text-editorial-ink" : "bg-editorial-sand";
      case "Attempted Contact":
        return styleType === "bar" ? "bg-[#bca07e]" : styleType === "text" ? "text-[#8c7355]" : "bg-[#f5f1eb]";
      case "In Discussion":
        return styleType === "bar" ? "bg-[#c4a962]" : styleType === "text" ? "text-[#a0843e]" : "bg-[#faf6eb]";
      case "Connected":
        return styleType === "bar" ? "bg-emerald-800" : styleType === "text" ? "text-emerald-900" : "bg-emerald-50";
      case "Follow-up Needed":
        return styleType === "bar" ? "bg-rose-800" : styleType === "text" ? "text-rose-950" : "bg-rose-50";
      case "Not Interested":
      default:
        return styleType === "bar" ? "bg-slate-500" : styleType === "text" ? "text-slate-600" : "bg-slate-100";
    }
  };

  return (
    <div className="bg-white border border-editorial-linen p-6 space-y-6" id="timeline-trends-dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-editorial-linen/30 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="editorial-badge bg-editorial-ink text-editorial-egg">interactive visualizer</span>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-editorial-ink flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Claimant Timeline & Historical Conversion Funnel
            </h3>
          </div>
          <p className="text-xs text-editorial-mud font-serif italic">
            Monitor how participant profiles migrated over weeks, culminating in today's reset of all 100 records back to 'New'.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1 px-3 py-1.5 border border-editorial-linen text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              isPlaying ? "bg-editorial-ink text-editorial-egg border-editorial-ink animate-pulse" : "bg-white hover:bg-editorial-sand/40"
            }`}
            id="timeline-play-btn"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3 inline shrink-0" />
                Pause Flow
              </>
            ) : (
              <>
                <Play className="h-3 w-3 inline shrink-0" />
                Play Timeline
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              setSelectedWeek(3);
              setIsPlaying(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-editorial-linen bg-white text-[11px] font-mono font-bold uppercase tracking-wider text-editorial-mud hover:text-editorial-ink cursor-pointer hover:bg-editorial-sand/40"
            title="Reset to current database state"
            id="timeline-reset-btn"
          >
            <RotateCcw className="h-3 w-3 shrink-0" />
            Reset State
          </button>
        </div>
      </div>

      {/* Timeline Steps / Week Selection Map */}
      <div className="relative pt-4 pb-2 px-1">
        {/* Progress connecting horizontal line */}
        <div className="absolute top-[37px] left-10 right-10 h-0.5 bg-editorial-linen/60" />
        <div 
          className="absolute top-[37px] left-10 h-0.5 bg-editorial-ink transition-all duration-500" 
          style={{ width: `${(selectedWeek / 3) * 82}%` }}
        />

        <div className="grid grid-cols-4 relative select-none">
          {weeks.map((week) => {
            const isActive = selectedWeek === week.id;
            const isCompleted = selectedWeek >= week.id;

            return (
              <div 
                key={week.id} 
                className="flex flex-col items-center text-center cursor-pointer group"
                onClick={() => {
                  setSelectedWeek(week.id);
                  setIsPlaying(false);
                }}
              >
                {/* Node bubble */}
                <div 
                  className={`h-9 w-9 flex items-center justify-center rounded-full border-2 transition-all duration-300 z-10 ${
                    isActive 
                      ? "bg-editorial-ink border-editorial-ink text-editorial-egg scale-110 shadow-xs" 
                      : isCompleted 
                        ? "bg-editorial-egg border-editorial-ink text-editorial-ink" 
                        : "bg-white border-editorial-linen text-editorial-mud group-hover:border-editorial-mud"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-editorial-ink" />
                  ) : (
                    <Calendar className="h-4.5 w-4.5" />
                  )}
                </div>

                {/* Node info labels */}
                <span className={`text-[10px] font-mono uppercase tracking-wider mt-3 transition-colors ${
                  isActive ? "text-editorial-ink font-bold" : "text-editorial-mud group-hover:text-editorial-ink"
                }`}>
                  Week {week.id + 1}
                </span>
                <span className={`text-[11px] font-serif transition-colors max-w-[120px] hidden sm:block italic mt-0.5 leading-tight ${
                  isActive ? "text-editorial-ink font-bold" : "text-editorial-mud"
                }`}>
                  {week.label}
                </span>
                <span className="text-[9px] font-mono text-editorial-mud/70 mt-1 hidden md:block">
                  {week.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week Insights Details panel */}
      <div className="bg-editorial-board border border-editorial-linen/60 p-4 font-serif text-xs md:text-sm space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-editorial-ink" />
          <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-editorial-ink">Historical Log Entry</span>
          <span className="text-emerald-800 font-mono text-[9px] ml-auto uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            {currentWeekData.date}
          </span>
        </div>
        <p className="text-editorial-ink font-serif font-semibold text-sm">
          {currentWeekData.label}
        </p>
        <p className="text-editorial-mud italic leading-relaxed text-xs">
          {currentWeekData.details}
        </p>
      </div>

      {/* Interactive Chart/Visual Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Left Column: Visual Stacked Funnel segments (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-editorial-ink">
              Status Breakdown Funnel ({totalInWeek} claimants)
            </h4>
            <span className="text-[10px] font-mono text-editorial-mud italic">
              Hover statuses below to isolate cohort
            </span>
          </div>

          <div className="space-y-3">
            {statusTypes.map((status) => {
              const count = activeStats[status] || 0;
              const pct = totalInWeek > 0 ? (count / totalInWeek) * 100 : 0;
              const isHovered = hoveredStatus === status;
              const hasActiveHover = hoveredStatus !== null;

              return (
                <div 
                  key={status}
                  className={`space-y-1 transition-all duration-200 p-2 border ${
                    isHovered 
                      ? "bg-editorial-sand/40 border-editorial-ink" 
                      : hasActiveHover 
                        ? "border-transparent opacity-30 scale-98" 
                        : "border-transparent"
                  }`}
                  onMouseEnter={() => setHoveredStatus(status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-semibold flex items-center gap-1.5 ${getStatusColor(status, "text")}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(status, "bar")}`} />
                      {status}
                    </span>
                    <span className="text-editorial-ink font-bold">
                      {count} <span className="text-editorial-mud font-normal font-serif text-[11px]">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>

                  <div className="bg-editorial-board border border-editorial-linen/40 h-5 overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full ${getStatusColor(status, "bar")} transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1)`}
                      style={{ width: `${pct}%` }}
                    />
                    
                    {/* Animated grid tick marks */}
                    <div className="absolute inset-y-0 left-1/4 border-r border-editorial-linen/30 border-dashed" />
                    <div className="absolute inset-y-0 left-1/2 border-r border-editorial-linen/30 border-dashed" />
                    <div className="absolute inset-y-0 left-3/4 border-r border-editorial-linen/30 border-dashed" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Key Interactive Conversion metrics & Logs (5 columns) */}
        <div className="lg:col-span-5 border border-editorial-linen bg-editorial-board/30 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-editorial-ink border-b border-editorial-linen pb-2">
              Conversion Insights
            </h4>

            {/* Micro infographics widget */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-editorial-mud uppercase block">Outreach Attempt Rate</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white border border-editorial-linen h-2 overflow-hidden">
                    <div 
                      className="h-full bg-[#8c7355] transition-all duration-500"
                      style={{ 
                        width: `${((totalInWeek - activeStats["New"]) / totalInWeek) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-editorial-ink font-bold shrink-0">
                    {(((totalInWeek - activeStats["New"]) / totalInWeek) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-editorial-mud uppercase block">Positive Discussion Index</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white border border-editorial-linen h-2 overflow-hidden">
                    <div 
                      className="h-full bg-[#a0843e] transition-all duration-500"
                      style={{ 
                        width: `${(activeStats["In Discussion"] / totalInWeek) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-editorial-ink font-bold shrink-0">
                    {((activeStats["In Discussion"] / totalInWeek) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-editorial-mud uppercase block">Intake Connection Index</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white border border-editorial-linen h-2 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-800 transition-all duration-500"
                      style={{ 
                        width: `${(activeStats["Connected"] / totalInWeek) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-editorial-ink font-bold shrink-0">
                    {((activeStats["Connected"] / totalInWeek) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-editorial-linen">
            <div className="bg-white border p-3 text-xs italic font-serif leading-relaxed text-editorial-mud text-center">
              {selectedWeek === 3 ? (
                <span>
                  "At this time, there is a clean status sheet overall. Click on <strong className="text-editorial-ink font-sans">Week 2</strong> or <strong className="text-editorial-ink font-sans">Week 3</strong> at the top to view simulated changes of participants over time, or click <strong className="text-editorial-ink font-sans">Play</strong> to watch the pipeline stream!"
                </span>
              ) : selectedWeek === 2 ? (
                <span>
                  "The highest density of Active Discussions was reached by Week 3. A significant block of 18 claimants was connected."
                </span>
              ) : selectedWeek === 1 ? (
                <span>
                  "Outreach efforts began. More than 45 claimants were contacted within a single week calendar cycle."
                </span>
              ) : (
                <span>
                  "Initial data load: All 100 records imported as 'New'. Zero active discussions started."
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
