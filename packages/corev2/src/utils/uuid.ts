import type { NodeId } from "../types/utils";

export function generateId(): NodeId {
	if ("crypto" in globalThis) {
		return crypto.randomUUID() as NodeId;
	}
	return generateInternalId() as NodeId;
}

function generateInternalId(): string {
	return `${generateRandomString(8)}-${generateRandomString(
		4,
	)}-${generateRandomString(4)}-${generateRandomString(
		4,
	)}-${generateRandomString(12)}`;
}

function generateRandomString(length: number): string {
	return Math.random()
		.toString(36)
		.substring(2, 2 + length);
}
