/**
 * Enforces the qualified line ID format.
 * @param agencyId The ID of the agency this line belongs to.
 * @param lineId The ID of the line.
 * @returns The qualified line ID.
 */
export function getQualifiedLineId(agencyId: string, lineId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the line ID is a non-empty string
	if (typeof lineId !== 'string' || !lineId.trim()) {
		throw new Error('Invalid line ID: must be a non-empty string.');
	}
	// Construct the qualified line ID using a consistent format
	return `[${agencyId}]${lineId}`;
}
