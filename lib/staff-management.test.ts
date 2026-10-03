import assert from "node:assert/strict";
import test from "node:test";
import {
  STANDARD_DEPARTMENTS,
  STANDARD_SPECIALIZATIONS,
  getSpecializationOptions,
  getDepartmentAndServiceOptions,
} from "./department-options.ts";
import type { Staff, CreateStaffPayload, UpdateStaffPayload } from "../types/staff.ts";

test("STANDARD_DEPARTMENTS contains core CableOps departments", () => {
  assert.ok(STANDARD_DEPARTMENTS.includes("Fiber Optics & Splicing"));
  assert.ok(STANDARD_DEPARTMENTS.includes("Field Linesmen & Wiring"));
  assert.ok(STANDARD_DEPARTMENTS.includes("New Installations & STB Setup"));
  assert.ok(STANDARD_DEPARTMENTS.includes("Network Operations (NOC)"));
});

test("STANDARD_SPECIALIZATIONS contains CableOps technician types", () => {
  assert.ok(STANDARD_SPECIALIZATIONS.includes("Fiber Technician"));
  assert.ok(STANDARD_SPECIALIZATIONS.includes("Linesman"));
  assert.ok(STANDARD_SPECIALIZATIONS.includes("Installation Technician"));
  assert.ok(STANDARD_SPECIALIZATIONS.includes("NOC Specialist"));
});

test("getSpecializationOptions adds custom specialization if not in standard list", () => {
  const options = getSpecializationOptions("Custom Headend Technician");
  assert.ok(options.includes("Custom Headend Technician"));
  assert.ok(options.includes("Fiber Technician"));
});

test("Staff type safely supports specialization and field duties", () => {
  const staffMember: Staff = {
    id: "staff-101",
    name: "Rahul Sharma",
    username: "rahul_sharma",
    email: "rahul@cableops.com",
    phone: "+91 98111 22334",
    location: "North Sector Hub",
    employeeId: "EMP-00101",
    department: "Fiber Optics & Splicing",
    specialization: "Fiber Technician",
    employmentType: "full-time",
    role: "staff",
    dutiesAssigned: 4,
    emergencyContact: {
      name: "Sunita Sharma",
      phone: "+91 98111 99999",
      relationship: "Spouse",
    },
    isActive: true,
    status: "Active",
    joinedDate: "2026-01-15T00:00:00.000Z",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  };

  assert.equal(staffMember.specialization, "Fiber Technician");
  assert.equal(staffMember.department, "Fiber Optics & Splicing");
  assert.equal(staffMember.dutiesAssigned, 4);
});
