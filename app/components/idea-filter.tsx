"use client";

import React from "react";

export type SectionOption = "ideasboard" | "buildboard" | "miniapps";

interface IdeaFilterProps {
  currentSection: SectionOption;
  onSectionChange: (section: SectionOption) => void;
}

const sections: { value: SectionOption; label: string }[] = [
  { value: "ideasboard", label: "Ideasboard" },
  { value: "buildboard", label: "Buildboard" },
  { value: "miniapps", label: "Miniapps" },
];

export const IdeaFilter = ({ currentSection, onSectionChange }: IdeaFilterProps) => {
  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {sections.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSectionChange(value)}
          className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            currentSection === value
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
