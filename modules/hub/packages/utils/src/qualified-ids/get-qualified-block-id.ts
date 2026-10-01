/**
 * Enforces the qualified block ID format.
 * @param agencyId The ID of the agency this block belongs to.
 * @param blockId The ID of the block.
 * @returns The qualified block ID.
 */
export function getQualifiedBlockId(agencyId: string, blockId: string | undefined): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Return empty if the block ID is empty
	if (typeof blockId !== 'string' || !blockId.trim()) {
		return '';
	}
	// Construct the qualified block ID using a consistent format
	return `[${agencyId}]${blockId}`;
}
