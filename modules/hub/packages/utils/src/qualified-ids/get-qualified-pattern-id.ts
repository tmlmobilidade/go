/**
 * Enforces the qualified pattern ID format.
 * @param agencyId The ID of the agency this pattern belongs to.
 * @param patternId The ID of the pattern.
 * @returns The qualified pattern ID.
 */
export function getQualifiedPatternId(agencyId: string, patternId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the pattern ID is a non-empty string
	if (typeof patternId !== 'string' || !patternId.trim()) {
		throw new Error('Invalid pattern ID: must be a non-empty string.');
	}
	// Construct the qualified pattern ID using a consistent format
	return `[${agencyId}]${patternId}`;
}
