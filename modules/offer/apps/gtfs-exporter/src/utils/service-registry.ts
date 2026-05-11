/* * */

import { type OperationalDate } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';

/* * */

export type ServiceId = string;

export interface ServiceIdInfo {
	dates: Set<OperationalDate>
	serviceId: ServiceId
}

export interface ServiceRuleTokenEntry {
	patterns: string[]
	ruleToken: string
}

export interface ServiceRuleMapInfo {
	dates: Set<OperationalDate>
	ruleTokens: ServiceRuleTokenEntry[]
	serviceId: ServiceId
}

/**
 * Global registry of service IDs and their corresponding date sets.
 * This ensures that patterns with identical schedules share the same serviceId.
 */
export class ServiceRegistry {
	// Map: hash of dates -> serviceId (for quick lookup)
	private servicesByDateHash = new Map<string, ServiceId>();

	// Map: serviceId -> date set
	private servicesById = new Map<ServiceId, Set<OperationalDate>>();

	// Map: serviceId -> ruleToken -> Set of pattern codes
	private serviceRuleTokens = new Map<ServiceId, Map<string, Set<string>>>();

	// Map: base rule token name -> array of serviceIds in order of first encounter.
	// Used to disambiguate identical token names that map to different date sets.
	private ruleTokenServiceIds = new Map<string, ServiceId[]>();

	// Map: rule-token serviceId -> date set (the externally visible service registry).
	// Populated by registerServiceId() after resolveRuleToken() produces the final token.
	private tokenServices = new Map<ServiceId, Set<OperationalDate>>();

	/**
	 * Resolves the final rule token name for a given (ruleToken, serviceId) pair.
	 * If this exact ruleToken+serviceId combination was seen before, returns the same
	 * suffixed name. If the ruleToken was seen with a DIFFERENT serviceId, appends
	 * " 2", " 3", etc. to disambiguate.
	 */
	resolveRuleToken(ruleToken: string, serviceId: ServiceId): string {
		const existing = this.ruleTokenServiceIds.get(ruleToken);

		if (!existing) {
			// First time this token name is seen.
			this.ruleTokenServiceIds.set(ruleToken, [serviceId]);
			return ruleToken;
		}

		const idx = existing.indexOf(serviceId);

		if (idx === 0) return ruleToken;
		if (idx > 0) return idx === 1 ? `${ruleToken} 2` : `${ruleToken} ${idx + 1}`;

		// New serviceId for this token — assign next suffix.
		existing.push(serviceId);
		const newIdx = existing.length - 1;
		return newIdx === 1 ? `${ruleToken} 2` : `${ruleToken} ${newIdx + 1}`;
	}

	/**
	 * Registers a resolved rule token as an externally visible serviceId with its date set.
	 * Idempotent: calling again with the same token and identical dates is a no-op.
	 * This is what populates calendar_dates.txt — the hash-based internal serviceId is
	 * never exposed outside the registry.
	 */
	registerServiceId(serviceId: ServiceId, dates: Set<OperationalDate>): void {
		if (!this.tokenServices.has(serviceId)) {
			this.tokenServices.set(serviceId, new Set(dates));
		}
	}

	/**
	 * Attaches a rule token and the originating pattern to a serviceId.
	 * Multiple patterns can share the same rule token for the same service.
	 */
	attachRuleToken(serviceId: ServiceId, ruleToken: string, patternCode: string): void {
		if (!this.serviceRuleTokens.has(serviceId)) {
			this.serviceRuleTokens.set(serviceId, new Map());
		}

		const tokenMap = this.serviceRuleTokens.get(serviceId);

		if (!tokenMap.has(ruleToken)) {
			tokenMap.set(ruleToken, new Set());
		}

		tokenMap.get(ruleToken).add(patternCode);
	}

	/**
	 * Returns a map of all service IDs with their date sets and contributing rule tokens + patterns.
	 */
	getServiceRuleMap(): Map<ServiceId, ServiceRuleMapInfo> {
		const result = new Map<ServiceId, ServiceRuleMapInfo>();

		for (const [serviceId, dates] of this.tokenServices.entries()) {
			const tokenMap = this.serviceRuleTokens.get(serviceId);
			const ruleTokens: ServiceRuleTokenEntry[] = [];

			if (tokenMap) {
				for (const [ruleToken, patternSet] of tokenMap.entries()) {
					ruleTokens.push({ patterns: Array.from(patternSet).sort(), ruleToken });
				}

				ruleTokens.sort((a, b) => a.ruleToken.localeCompare(b.ruleToken));
			}

			result.set(serviceId, { dates, ruleTokens, serviceId });
		}

		return result;
	}

	/**
	 * Gets all registered services
	 * @returns Map of serviceId to ServiceIdInfo
	 */
	getAllServices(): Map<ServiceId, ServiceIdInfo> {
		const result = new Map<string, ServiceIdInfo>();
		for (const [serviceId, dates] of this.tokenServices.entries()) {
			result.set(serviceId, { dates, serviceId });
		}
		return result;
	}

	/**
	 * Gets or creates a serviceId for a given set of dates
	 * @param dates - Set of operational dates
	 * @returns The serviceId for this date set
	 */
	getOrCreateServiceId(dates: Set<OperationalDate>): ServiceId {
		// Create a hash of the sorted dates for lookup
		const sortedDates = Array.from(dates).sort();
		const dateHash = sortedDates.join(',');

		// Check if we already have a serviceId for this exact date set
		const existingServiceId = this.servicesByDateHash.get(dateHash);
		if (existingServiceId) {
			return existingServiceId;
		}

		// Generate a new serviceId
		const newServiceId = this.generateServiceId(dates);

		// Store the mapping
		this.servicesById.set(newServiceId, new Set(dates));
		this.servicesByDateHash.set(dateHash, newServiceId);

		return newServiceId;
	}

	/**
	 * Builds a mapping from text service IDs to numeric string IDs.
	 * Services are sorted by date count descending (most dates = "1").
	 * Ties are broken alphabetically by service ID for determinism.
	 * @returns Map<textServiceId, numericId>
	 */
	buildNumericCalendarMapping(): Map<ServiceId, string> {
		const sorted = Array.from(this.tokenServices.entries()).sort(([idA, datesA], [idB, datesB]) => {
			const diff = datesB.size - datesA.size;
			return diff !== 0 ? diff : idA.localeCompare(idB);
		});

		const mapping = new Map<ServiceId, string>();
		for (const [i, [serviceId]] of sorted.entries()) {
			mapping.set(serviceId, String(i + 1));
		}
		return mapping;
	}

	/**
	 * Gets the number of unique services
	 */
	getServiceCount(): number {
		return this.tokenServices.size;
	}

	/**
	 * Generates a stable serviceId based on the set of dates
	 * @param dates - Set of operational dates
	 * @returns A stable serviceId
	 */
	private generateServiceId(dates: Set<OperationalDate>): string {
		const sortedDates = Array.from(dates).sort();
		const dateString = sortedDates.join(',');
		const hash = createHash('sha256').update(dateString).digest('hex').slice(0, 12);
		return `SVC_${hash}`;
	}
}
