/**
 * Enforces the qualified vehicle ID format.
 * @param agencyId The ID of the agency this vehicle belongs to.
 * @param vehicleId The ID of the vehicle.
 * @returns The qualified vehicle ID.
 */
export function getQualifiedVehicleId(agencyId: string, vehicleId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the vehicle ID is a non-empty string
	if (typeof vehicleId !== 'string' || !vehicleId.trim()) {
		throw new Error('Invalid vehicle ID: must be a non-empty string.');
	}
	// Construct the qualified vehicle ID using a consistent format
	return `[${agencyId}]${vehicleId}`;
}
