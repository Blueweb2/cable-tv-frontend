/**
 * Monorepo Unified Type System
 * Aligns backend MongoDB schema models and frontend TypeScript interfaces.
 */

export * from "./auth";
export * from "./assignment";
export * from "./attendance";
export * from "./availability";
export * from "./expense";
export * from "./report";
export * from "./service";
export * from "./staff";
export * from "./task";
export * from "./zone";

/**
 * Unified MongoId Helper Type
 * Supports both raw MongoDB `_id` string and populated `id` mapped strings.
 */
export type MongoId = string;

export interface BaseEntity {
  _id: MongoId;
  id?: MongoId;
  createdAt: string;
  updatedAt: string;
}
