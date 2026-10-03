"use client";

import { SlidersHorizontal, Building2, Briefcase } from "lucide-react";
import {
  STANDARD_DEPARTMENTS,
  STANDARD_SPECIALIZATIONS,
} from "@/lib/department-options";

export type StaffFilter =
  | "All"
  | "Active"
  | "Inactive";

interface StaffFiltersProps {
  activeFilter: StaffFilter;
  selectedDepartment?: string;
  selectedSpecialization?: string;
  onFilterChange: (
    filter: StaffFilter,
  ) => void;
  onDepartmentChange?: (
    department: string,
  ) => void;
  onSpecializationChange?: (
    specialization: string,
  ) => void;
}

const statusFilters: StaffFilter[] = [
  "All",
  "Active",
  "Inactive",
];

export default function StaffFilters({
  activeFilter,
  selectedDepartment = "",
  selectedSpecialization = "",
  onFilterChange,
  onDepartmentChange,
  onSpecializationChange,
}: StaffFiltersProps) {
  return (
    <div className="space-y-2.5">
      {/* Status Filter Buttons */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="group"
        aria-label="Staff status filters"
      >
        {/* Filter Icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500"
          aria-hidden="true"
        >
          <SlidersHorizontal
            size={17}
            strokeWidth={1.9}
          />
        </div>

        {statusFilters.map((filter) => {
          const isActive =
            activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() =>
                onFilterChange(filter)
              }
              aria-pressed={isActive}
              className={`min-h-9 shrink-0 rounded-full px-4 text-xs font-medium transition active:scale-95 ${
                isActive
                  ? "bg-[#1F1F1F] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Department & Specialization Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {onDepartmentChange && (
          <div className="relative flex-1 min-w-[160px]">
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              aria-label="Filter by department"
              className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none transition focus:border-[#9A7B4F] cursor-pointer"
            >
              <option value="">All Departments</option>
              {STANDARD_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}

        {onSpecializationChange && (
          <div className="relative flex-1 min-w-[160px]">
            <select
              value={selectedSpecialization}
              onChange={(e) => onSpecializationChange(e.target.value)}
              aria-label="Filter by specialization"
              className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none transition focus:border-[#9A7B4F] cursor-pointer"
            >
              <option value="">All Specializations</option>
              {STANDARD_SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}