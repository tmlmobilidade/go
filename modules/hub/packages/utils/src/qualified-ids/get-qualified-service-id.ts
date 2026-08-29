/**
 * Enforces the qualified service ID format.
 * @param planId The ID of the plan this service belongs to.
 * @param agencyId The ID of the agency this service belongs to.
 * @param serviceId The ID of the service.
 * @returns The qualified service ID.
 */
export function getQualifiedServiceId(planId: string, agencyId: string, serviceId: string): string {
	// Validate that the plan ID is a non-empty string
	if (typeof planId !== 'string' || !planId.trim()) {
		throw new Error('Invalid plan ID: must be a non-empty string.');
	}
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the service ID is a non-empty string
	if (typeof serviceId !== 'string' || !serviceId.trim()) {
		throw new Error('Invalid service ID: must be a non-empty string.');
	}
	// Construct the qualified service ID using a consistent format
	return `[${planId}][${agencyId}]${serviceId}`;
}
