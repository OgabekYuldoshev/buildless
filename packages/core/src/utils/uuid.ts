import type { FieldId } from "../types";

export function generateId(): FieldId {
  if ("crypto" in globalThis) {
    return crypto.randomUUID() as FieldId;
  }
  return generateInternalId() as FieldId;
}

function generateInternalId(): string {
  return `${generateRandomString(8)}-${generateRandomString(
    4
  )}-${generateRandomString(4)}-${generateRandomString(
    4
  )}-${generateRandomString(12)}`;
}

function generateRandomString(length: number): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
