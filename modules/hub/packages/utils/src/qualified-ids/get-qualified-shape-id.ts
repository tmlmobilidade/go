/**
 * Enforces the qualified shape ID format.
 * @param planId The ID of the plan this shape belongs to.
 * @param agencyId The ID of the agency this shape belongs to.
 * @param shapeId The ID of the shape.
 * @returns The qualified shape ID.
 */
export function getQualifiedShapeId(planId: string, agencyId: string, shapeId: string): string {
	// Validate that the plan ID is a non-empty string
	if (typeof planId !== 'string' || !planId.trim()) {
		throw new Error('Invalid plan ID: must be a non-empty string.');
	}
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the shape ID is a non-empty string
	if (typeof shapeId !== 'string' || !shapeId.trim()) {
		throw new Error('Invalid shape ID: must be a non-empty string.');
	}
	// Construct the qualified shape ID using a consistent format
	return `[${planId}][${agencyId}]${shapeId}`;
}
