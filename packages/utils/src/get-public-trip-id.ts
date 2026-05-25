/**
 * Enforces the public trip ID format.
 * @param planId The ID of the plan this trip belongs to.
 * @param agencyId The ID of the agency this trip belongs to.
 * @param tripId The ID of the trip.
 * @returns The public trip ID.
 */
export function getPublicTripId(planId: string, agencyId: string, tripId: string): string {
	// Validate that the plan ID is a non-empty string
	if (typeof planId !== 'string' || !planId.trim()) {
		throw new Error('Invalid plan ID: must be a non-empty string.');
	}
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the trip ID is a non-empty string
	if (typeof tripId !== 'string' || !tripId.trim()) {
		throw new Error('Invalid trip ID: must be a non-empty string.');
	}
	// Construct the public trip ID using a consistent format
	return `[${planId}][${agencyId}]${tripId}`;
}

/**
 * Enforces the public shape ID format.
 * @param planId The ID of the plan this shape belongs to.
 * @param agencyId The ID of the agency this shape belongs to.
 * @param shapeId The ID of the shape.
 * @returns The public shape ID.
 */
export function getPublicShapeId(planId: string, agencyId: string, shapeId: string): string {
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
	// Construct the public shape ID using a consistent format
	return `[${planId}][${agencyId}]${shapeId}`;
}

/**
 * Enforces the public service ID format.
 * @param planId The ID of the plan this service belongs to.
 * @param agencyId The ID of the agency this service belongs to.
 * @param serviceId The ID of the service.
 * @returns The public service ID.
 */
export function getPublicServiceId(planId: string, agencyId: string, serviceId: string): string {
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
	// Construct the public service ID using a consistent format
	return `[${planId}][${agencyId}]${serviceId}`;
}

/**
 * Enforces the public line ID format.
 * @param agencyId The ID of the agency this line belongs to.
 * @param lineId The ID of the line.
 * @returns The public line ID.
 */
export function getPublicLineId(agencyId: string, lineId: number | string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the line ID is a non-empty string
	if (typeof lineId !== 'string' || !lineId.trim()) {
		throw new Error('Invalid line ID: must be a non-empty string.');
	}
	// Construct the public line ID using a consistent format
	return `[${agencyId}]${lineId}`;
}

/**
 * Enforces the public route ID format.
 * @param agencyId The ID of the agency this route belongs to.
 * @param routeId The ID of the route.
 * @returns The public route ID.
 */
export function getPublicRouteId(agencyId: string, routeId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the route ID is a non-empty string
	if (typeof routeId !== 'string' || !routeId.trim()) {
		throw new Error('Invalid route ID: must be a non-empty string.');
	}
	// Construct the public route ID using a consistent format
	return `[${agencyId}]${routeId}`;
}

/**
 * Enforces the public pattern ID format.
 * @param agencyId The ID of the agency this pattern belongs to.
 * @param patternId The ID of the pattern.
 * @returns The public pattern ID.
 */
export function getPublicPatternId(agencyId: string, patternId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the pattern ID is a non-empty string
	if (typeof patternId !== 'string' || !patternId.trim()) {
		throw new Error('Invalid pattern ID: must be a non-empty string.');
	}
	// Construct the public pattern ID using a consistent format
	return `[${agencyId}]${patternId}`;
}

/**
 * Enforces the public fare ID format.
 * @param agencyId The ID of the agency this fare belongs to.
 * @param fareId The ID of the fare.
 * @returns The public fare ID.
 */
export function getPublicFareId(agencyId: string, fareId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the fare ID is a non-empty string
	if (typeof fareId !== 'string' || !fareId.trim()) {
		throw new Error('Invalid fare ID: must be a non-empty string.');
	}
	// Construct the public fare ID using a consistent format
	return `[${agencyId}]${fareId}`;
}
