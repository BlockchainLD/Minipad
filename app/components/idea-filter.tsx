"use client";

import React from "react";

export type FilterOption = "newest" | "most-popular" | "claimed" | "completed";

interface IdeaFilterProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const filters: { value: FilterOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "most-popular", label: "Popular" },
  { value: "claimed", label: "Claimed" },
  { value: "completed", label: "Built" },
];

export const IdeaFilter = ({ currentFilter, onFilterChange }: IdeaFilterProps) => {
  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            currentFilter === value
              ? "bg-white text-violet-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/70 hover:shadow-sm"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
