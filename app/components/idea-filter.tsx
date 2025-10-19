"use client";

import React, { useState } from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { ArrowDown } from "iconoir-react";

export type FilterOption = "newest" | "most-popular" | "claimed";

interface IdeaFilterProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const filterLabels: Record<FilterOption, string> = {
  "newest": "Newest",
  "most-popular": "Most Popular", 
  "claimed": "Claimed"
};

export const IdeaFilter = ({ currentFilter, onFilterChange }: IdeaFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterSelect = (filter: FilterOption) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[140px] justify-between rounded-xl hover:shadow-md transition-all duration-200"
      >
        <span>{filterLabels[currentFilter]}</span>
        <ArrowDown 
          width={16} 
          height={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
            <div className="py-1">
              {Object.entries(filterLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleFilterSelect(value as FilterOption)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-all duration-200 ${
                    currentFilter === value 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
