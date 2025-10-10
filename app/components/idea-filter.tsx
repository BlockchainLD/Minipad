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
        className="flex items-center gap-2 min-w-[120px] justify-between"
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
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {Object.entries(filterLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleFilterSelect(value as FilterOption)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    currentFilter === value 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700'
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
