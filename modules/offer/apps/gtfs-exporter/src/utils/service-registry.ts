/* * */

import { type OperationalDate } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';

/* * */

export type ServiceId = string;

export interface ServiceIdInfo {
	dates: Set<OperationalDate>
	service_id: ServiceId
}

/**
 * Global registry of service IDs and their corresponding date sets.
 * This ensures that patterns with identical schedules share the same service_id.
 */
export class ServiceRegistry {
	// Map: hash of dates -> service_id (for quick lookup)
	private servicesByDateHash = new Map<string, ServiceId>();

	// Map: service_id -> date set
	private servicesById = new Map<ServiceId, Set<OperationalDate>>();

	/**
	 * Gets all registered services
	 * @returns Map of service_id to ServiceIdInfo
	 */
	getAllServices(): Map<ServiceId, ServiceIdInfo> {
		const result = new Map<string, ServiceIdInfo>();
		for (const [service_id, dates] of this.servicesById.entries()) {
			result.set(service_id, { dates, service_id });
		}
		return result;
	}

	/**
	 * Gets or creates a service_id for a given set of dates
	 * @param dates - Set of operational dates
	 * @returns The service_id for this date set
	 */
	getOrCreateServiceId(dates: Set<OperationalDate>): ServiceId {
		// Create a hash of the sorted dates for lookup
		const sortedDates = Array.from(dates).sort();
		const dateHash = sortedDates.join(',');

		// Check if we already have a service_id for this exact date set
		const existingServiceId = this.servicesByDateHash.get(dateHash);
		if (existingServiceId) {
			return existingServiceId;
		}

		// Generate a new service_id
		const newServiceId = this.generateServiceId(dates);

		// Store the mapping
		this.servicesById.set(newServiceId, new Set(dates));
		this.servicesByDateHash.set(dateHash, newServiceId);

		return newServiceId;
	}

	/**
	 * Gets the number of unique services
	 */
	getServiceCount(): number {
		return this.servicesById.size;
	}

	/**
	 * Generates a stable service_id based on the set of dates
	 * @param dates - Set of operational dates
	 * @returns A stable service_id
	 */
	private generateServiceId(dates: Set<OperationalDate>): string {
		const sortedDates = Array.from(dates).sort();
		const dateString = sortedDates.join(',');
		const hash = createHash('sha256').update(dateString).digest('hex').slice(0, 12);
		return `SVC_${hash}`;
	}
}
