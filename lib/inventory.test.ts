import test from "node:test";
import assert from "node:assert";

import type {
  Material,
  StockTransaction,
  MaterialRequest,
  CreateMaterialPayload,
  StockTransactionPayload,
  CreateMaterialRequestPayload,
  MaterialConsumptionPayload,
} from "../types/inventory.ts";

test("Material TypeScript interface adheres to CableOps catalog schema", () => {
  const sampleMaterial: Material = {
    _id: "507f1f77bcf86cd799439031",
    name: "6-Core Armored Single-Mode Fiber Cable",
    code: "FIB-6C-ARM",
    category: "Fiber Cable",
    unit: "meter",
    description: "Heavy-duty optical fiber for outdoor distribution",
    minimumStock: 200,
    currentStock: 1500,
    unitPrice: 25,
    location: "Main Store",
    isActive: true,
    isLowStock: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  assert.strictEqual(sampleMaterial.code, "FIB-6C-ARM");
  assert.strictEqual(sampleMaterial.category, "Fiber Cable");
  assert.strictEqual(sampleMaterial.unit, "meter");
  assert.strictEqual(sampleMaterial.currentStock, 1500);
});

test("CreateMaterialRequestPayload supports multi-item duty requests", () => {
  const payload: CreateMaterialRequestPayload = {
    dutyId: "507f1f77bcf86cd799439041",
    technicianId: "507f1f77bcf86cd799439012",
    items: [
      {
        materialId: "507f1f77bcf86cd799439031",
        requestedQuantity: 120,
      },
      {
        materialId: "507f1f77bcf86cd799439032",
        requestedQuantity: 6,
      },
    ],
    requestNotes: "Emergency fiber break repair near Sector 4 Tap",
  };

  assert.strictEqual(payload.dutyId, "507f1f77bcf86cd799439041");
  assert.strictEqual(payload.items.length, 2);
  assert.strictEqual(payload.items[0].requestedQuantity, 120);
});

test("MaterialConsumptionPayload validates used and returned quantities", () => {
  const consumption: MaterialConsumptionPayload = {
    items: [
      {
        materialId: "507f1f77bcf86cd799439031",
        usedQuantity: 95,
        returnedQuantity: 25,
      },
      {
        materialId: "507f1f77bcf86cd799439032",
        usedQuantity: 4,
        returnedQuantity: 2,
      },
    ],
  };

  assert.strictEqual(consumption.items.length, 2);
  assert.strictEqual(consumption.items[0].usedQuantity + consumption.items[0].returnedQuantity, 120);
  assert.strictEqual(consumption.items[1].usedQuantity + consumption.items[1].returnedQuantity, 6);
});

test("StockTransactionPayload validates auditable transaction types", () => {
  const stockInTx: StockTransactionPayload = {
    materialId: "507f1f77bcf86cd799439031",
    transactionType: "STOCK_IN",
    quantity: 500,
    reference: "PO-2026-091",
    notes: "Direct factory receipt from vendor",
    location: "Main Store",
  };

  const returnTx: StockTransactionPayload = {
    materialId: "507f1f77bcf86cd799439031",
    transactionType: "RETURN",
    quantity: 25,
    dutyId: "507f1f77bcf86cd799439041",
    technicianId: "507f1f77bcf86cd799439012",
    notes: "Unused drop fiber returned to store",
    location: "Main Store",
  };

  assert.strictEqual(stockInTx.transactionType, "STOCK_IN");
  assert.strictEqual(returnTx.transactionType, "RETURN");
  assert.strictEqual(returnTx.dutyId, "507f1f77bcf86cd799439041");
});
