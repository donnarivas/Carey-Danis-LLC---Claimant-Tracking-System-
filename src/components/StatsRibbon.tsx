import React from "react";
import { CRMStats, CategoryType, StatusType } from "../types";
import { Users, GraduationCap, BrainCircuit, Users2, Church, Target, Home, Sparkles, CheckCircle2 } from "lucide-react";

interface StatsRibbonProps {
  stats: CRMStats;
  activeCategory: CategoryType | null;
  setActiveCategory: (cat: CategoryType | null) => void;
  activeStatus: StatusType | null;
  setActiveStatus: (st: StatusType | null) => void;
}

const CATEGORY_ICONS: Record<CategoryType, React.ReactElement> = {
  "School Counselor": <GraduationCap className="h-4 w-4" />,
  "Therapist": <BrainCircuit className="h-4 w-4" />,
  "Parent Organization": <Users2 className="h-4 w-4" />,
  "Church": <Church className="h-4 w-4" />,
  "Youth Nonprofit": <Target className="h-4 w-4" />,
  "Community Center": <Home className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<CategoryType, string> = {
  "School Counselor": "bg-white border-editorial-linen text-editorial-ink hover:bg-editorial-sand/60",
  "Therapist": "bg-white border-editorial-linen text-editorial-ink hover:bg-editorial-sand/60",
  "Parent Organization": "bg-white border-editorial-linen text-editorial-ink hover:bg-editorial-sand/60",
  "Church": "bg-white border-editorial-linen text-editorial-ink hover:bg-editorial-sand/60",
  "Youth Nonprofit": "bg-white border-editorial-linen text-editorial-ink hover:bg-editorial-sand/60",
  "Community Center": "bg-white border-editorial-linen text-editorial-ink hover:bg-editorial-sand/60",
};

const ACTIVE_CATEGORY_COLORS: Record<CategoryType, string> = {
  "School Counselor": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Therapist": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Parent Organization": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Church": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Youth Nonprofit": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Community Center": "bg-editorial-ink border-editorial-ink text-editorial-egg",
};

const STATUS_BORDER_COLORS: Record<StatusType, string> = {
  "New": "border-editorial-linen text-editorial-ink bg-white hover:bg-editorial-sand/60",
  "Attempted Contact": "border-editorial-linen text-editorial-ink bg-white hover:bg-editorial-sand/60",
  "In Discussion": "border-editorial-linen text-editorial-ink bg-white hover:bg-editorial-sand/60",
  "Connected": "border-editorial-linen text-editorial-ink bg-white hover:bg-editorial-sand/60",
  "Follow-up Needed": "border-editorial-linen text-editorial-ink bg-white hover:bg-editorial-sand/60",
  "Not Interested": "border-editorial-linen text-editorial-ink bg-white hover:bg-editorial-sand/60",
};

const ACTIVE_STATUS_COLORS: Record<StatusType, string> = {
  "New": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Attempted Contact": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "In Discussion": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Connected": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Follow-up Needed": "bg-editorial-ink border-editorial-ink text-editorial-egg",
  "Not Interested": "bg-editorial-ink border-editorial-ink text-editorial-egg",
};

export const StatsRibbon: React.FC<StatsRibbonProps> = ({
  stats,
  activeCategory,
  setActiveCategory,
  activeStatus,
  setActiveStatus,
}) => {
  // Goal details
  const goal = 100;
  const percentage = Math.min((stats.total / goal) * 100, 100);
  const isGoalReached = stats.total >= goal;

  const handleCategoryClick = (category: CategoryType) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
      setActiveStatus(null); // Clear status filter to show full category breakdown
    }
  };

  const handleStatusClick = (status: StatusType) => {
    if (activeStatus === status) {
      setActiveStatus(null);
    } else {
      setActiveStatus(status);
      setActiveCategory(null); // Clear category filter to show full status breakdown
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Progress Bar */}
      <div className="bg-editorial-board border border-editorial-linen p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm uppercase tracking-wider font-mono font-bold text-editorial-ink flex items-center gap-1.5">
              <Users className="h-4 w-4 text-editorial-ink" />
              Contacts Goal Tracker
            </h2>
            {isGoalReached && (
              <span className="editorial-badge bg-editorial-ink text-editorial-egg">
                Goal Achieved!
              </span>
            )}
          </div>
          <p className="text-xs text-editorial-mud font-serif italic">
            Maintaining a robust workspace requires at least <strong className="text-editorial-ink font-sans">100 active community records</strong>.
          </p>
        </div>

        <div className="flex-1 max-w-xl flex items-center gap-4">
          <div className="flex-1 bg-white border border-editorial-linen h-3 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 bg-editorial-ink`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-right shrink-0 font-mono text-xs">
            <span className="text-sm font-bold text-editorial-ink">{stats.total}</span>
            <span className="text-editorial-mud"> / {goal} entries</span>
          </div>
        </div>
      </div>

      {/* Main Breakdown Ribbons split by Categories and Statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Six Categories Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-editorial-linen p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-editorial-linen/30 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-editorial-ink flex items-center gap-1">
              Sector Directory <span className="font-serif italic font-normal text-editorial-mud text-[10px] lowercase">(click to filter)</span>
            </h3>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-editorial-mud hover:text-editorial-ink cursor-pointer"
                id="clear-cat-filter"
              >
                [Show All]
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(CATEGORY_ICONS) as CategoryType[]).map((category) => {
              const count = stats.byCategory[category] || 0;
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  id={`stat-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex flex-col text-left p-3 border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? ACTIVE_CATEGORY_COLORS[category]
                      : `${CATEGORY_COLORS[category]}`
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs font-serif italic">
                    <span className="opacity-80">{CATEGORY_ICONS[category]}</span>
                    <span className="truncate">{category}s</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-bold tracking-tight">{count}</span>
                    <span className="text-[10px] font-mono opacity-60 uppercase">recs</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Six Statuses Breakdown Grid (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-editorial-linen p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-editorial-linen/30 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-editorial-ink flex items-center gap-1">
              Outreach Pipeline <span className="font-serif italic font-normal text-editorial-mud text-[10px] lowercase">(click to filter)</span>
            </h3>
            {activeStatus && (
              <button
                onClick={() => setActiveStatus(null)}
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-editorial-mud hover:text-editorial-ink cursor-pointer"
                id="clear-status-filter"
              >
                [Show All]
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(STATUS_BORDER_COLORS) as StatusType[]).map((status) => {
              const count = stats.byStatus[status] || 0;
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusClick(status)}
                  id={`stat-status-${status.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex flex-col justify-between text-left p-2.5 border transition-all duration-150 cursor-pointer min-h-[72px] ${
                    isActive
                      ? ACTIVE_STATUS_COLORS[status]
                      : `${STATUS_BORDER_COLORS[status]}`
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-tight leading-none mb-2">{status}</span>
                  <span className="text-2xl font-serif font-bold tracking-tight">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
