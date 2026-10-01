import assert from "node:assert/strict";
import test from "node:test";

import { mapAssignmentToDuty } from "./duty-mapper.ts";

test("maps a populated CableOps field assignment into the duty card data", () => {
  const duty = mapAssignmentToDuty({
    _id: "duty-cable-1",
    zone: {
      _id: "zone-1",
      name: "North Sector FTTH",
      code: "Z-NORTH",
      coverageArea: "North Industrial Park",
      zoneType: "FIBER_FTTH" as const,
      totalSubscribers: 450,
      nodes: [
        {
          nodeNumber: "NODE-42",
          location: "North Industrial Gate",
          opticalPowerDbm: "-18.5",
          status: "HEALTHY" as const,
        },
      ],
      status: "OPERATIONAL" as const,
    },
    zoneName: "North Sector FTTH (Z-NORTH)",
    nodeNumber: "NODE-42",
    staff: {
      id: "staff-1",
      name: "Rahul Sharma",
      username: "rahul_sharma",
      email: "rahul@cableops.com",
      phone: "9811122334",
      employeeId: "TECH-001",
      department: "Fiber Optics & Splicing",
      location: "North Hub",
    },
    dutyTitle: "Fiber Cut Emergency Splice",
    jobType: "FIBER_SPLICING",
    priority: "CRITICAL_OUTAGE",
    description: "Main 24-core backbone severed at pole 18.",
    dutyDate: "2026-10-01T00:00:00.000Z",
    startTime: "09:00",
    endTime: "13:00",
    hourlyRate: 350,
    totalHours: 4,
    totalAmount: 1400,
    status: "IN_PROGRESS",
    assignedBy: "manager-1",
    checklist: [
      { text: "OTDR Fault Distance Check", completed: true },
      { text: "Core Fusion Splicing", completed: false },
    ],
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  });

  assert.equal(duty.id, "duty-cable-1");
  assert.equal(duty.title, "Fiber Cut Emergency Splice");
  assert.equal(duty.event, "North Sector FTTH (Z-NORTH)");
  assert.equal(duty.eventDate, "2026-10-01");
  assert.equal(duty.startTime, "09:00 AM");
  assert.equal(duty.endTime, "01:00 PM");
  assert.equal(duty.staffId, "staff-1");
  assert.equal(duty.staffName, "Rahul Sharma");
  assert.equal(duty.department, "Fiber Optics & Splicing");
  assert.equal(duty.status, "IN_PROGRESS");
  assert.equal(duty.totalHours, 4);
  assert.equal(duty.totalAmount, 1400);
  assert.equal(duty.checklist?.length, 2);
});

test("keeps assignment IDs when populated zone and staff are unavailable", () => {
  const duty = mapAssignmentToDuty({
    _id: "duty-cable-2",
    zone: "zone-2",
    zoneName: "East Distribution Area",
    staff: "staff-2",
    dutyTitle: "Customer STB Installation",
    dutyDate: "2026-10-02",
    startTime: "14:00",
    endTime: "16:00",
    status: "ASSIGNED",
    assignedBy: "manager-1",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  });

  assert.equal(duty.id, "duty-cable-2");
  assert.equal(duty.title, "Customer STB Installation");
  assert.equal(duty.event, "East Distribution Area");
  assert.equal(duty.startTime, "02:00 PM");
  assert.equal(duty.endTime, "04:00 PM");
  assert.equal(duty.staffId, "staff-2");
  assert.equal(duty.staffName, "Technician");
  assert.equal(duty.status, "ASSIGNED");
});

