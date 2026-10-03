import test from "node:test";
import assert from "node:assert";

import type {
  Assignment,
  CreateAssignmentPayload,
  JobType,
  PriorityLevel,
} from "../types/assignment.ts";

import type {
  StaffRecommendation,
  RecommendationQueryParams,
} from "./department.api.ts";

test("CreateAssignmentPayload supports zone, lead technician, and team members", () => {
  const payload: CreateAssignmentPayload = {
    zone: "507f1f77bcf86cd799439011",
    zoneName: "Sector 4 Hub (NORTH-Z4)",
    nodeNumber: "NODE-4A",
    staff: "507f1f77bcf86cd799439012",
    assignedStaff: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
    specializationRequired: "Fiber Technician",
    dutyTitle: "Main Trunk Fiber Splicing",
    jobType: "FIBER_SPLICING",
    priority: "HIGH",
    role: "Lead Splicer",
    department: "Fiber Optics & Splicing",
    dutyDate: "2026-10-05",
    startTime: "09:00",
    endTime: "15:00",
    hourlyRate: 175,
    notes: "Requires OTDR calibration meter",
  };

  assert.strictEqual(payload.staff, "507f1f77bcf86cd799439012");
  assert.strictEqual(payload.assignedStaff?.length, 2);
  assert.strictEqual(payload.jobType, "FIBER_SPLICING");
  assert.strictEqual(payload.specializationRequired, "Fiber Technician");
});

test("StaffRecommendation matches scoring breakdown interface", () => {
  const mockRec: StaffRecommendation = {
    _id: "507f1f77bcf86cd799439012",
    id: "507f1f77bcf86cd799439012",
    name: "Rahul Sharma",
    email: "rahul@cableops.com",
    phone: "+91 98765 43210",
    department: "Fiber Optics & Splicing",
    specialization: "Fiber Technician",
    employeeId: "EMP-1001",
    location: "North Hub",
    matchScore: 110,
    availabilityStatus: "AVAILABLE",
    activeDutiesCount: 0,
    matchReasons: [
      "Exact Specialization (Fiber Technician)",
      "Department Match (Fiber Optics & Splicing)",
      "Available on Shift Date",
      "Low Workload (0 active duties)",
    ],
  };

  assert.strictEqual(mockRec.name, "Rahul Sharma");
  assert.strictEqual(mockRec.matchScore, 110);
  assert.strictEqual(mockRec.matchReasons.length, 4);
});

test("Assignment status and priorities enforce CableOps operational requirements", () => {
  const validJobTypes: JobType[] = [
    "FIBER_SPLICING",
    "LINE_REPAIR",
    "NEW_INSTALLATION",
    "NODE_MAINTENANCE",
    "SIGNAL_OPTIMIZATION",
    "COMPLAINT_RESOLUTION",
    "PAYMENT_COLLECTION",
    "FIELD_PATROL",
    "GENERAL_SHIFT",
  ];

  const validPriorities: PriorityLevel[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
    "CRITICAL_OUTAGE",
    "URGENT",
  ];

  assert.ok(validJobTypes.includes("FIBER_SPLICING"));
  assert.ok(validJobTypes.includes("LINE_REPAIR"));
  assert.ok(validJobTypes.includes("NEW_INSTALLATION"));
  assert.ok(validPriorities.includes("CRITICAL_OUTAGE"));
});
