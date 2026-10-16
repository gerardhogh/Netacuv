"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = 
  | string 
  | { 
      label: string; 
      value: string; 
      icon?: ReactNode; 
      sublabel?: string;
    };

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "pill" | "rounded";
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Sélectionner",
  disabled = false,
  className = "",
  buttonClassName = "",
  size = "md",
  variant = "rounded",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to { label, value, icon, sublabel }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { label: opt, value: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-3.5 py-2.5 text-sm",
    lg: "px-4 py-3 text-sm",
  }[size];

  const roundedClasses = variant === "pill" ? "rounded-full" : "rounded-xl";

  return (
    <div className={`relative min-w-[150px] ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 border bg-white text-slate-700 transition-all shadow-xs cursor-pointer ${sizeClasses} ${roundedClasses} ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
            : isOpen
            ? "border-[#32A8D7] ring-2 ring-[#32A8D7]/20"
            : "border-slate-200 hover:border-[#32A8D7]/60"
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className={`truncate font-medium ${selectedOption ? "text-slate-800" : "text-slate-400"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#32A8D7]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 min-w-[160px] bg-white border border-slate-200/90 rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 py-1.5">
          {normalizedOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">
              Aucune option disponible
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#eaf6fc] text-[#1e8ae9] font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <div className="truncate">
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block text-xs text-slate-400 font-normal">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={16} className="text-[#1e8ae9] shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
