/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsV29ExportConfig } from '@/types.js';
import { Agency, Fare, GtfsTMLFareAttributes, GtfsTMLFareRules, Line, Route } from '@tmlmobilidade/types';

/* * */

/**
 * Parses fare attributes data into GTFS fare_attributes.txt format
 * @param agencyData - The agency data
 * @param fareData - The fare data
 * @returns The formatted fare attributes row
 */
export function parseFareAttributes(
	agencyData: Agency,
	fareData: Fare,
): GtfsTMLFareAttributes {
	try {
		return {
			fare_id: fareData.code,
			price: fareData.price,
			currency_type: fareData.currency_type,
			payment_method: Number(fareData.payment_method),
			transfers: fareData.transfers === 'unlimited' ? 999 : Number(fareData.transfers),
			agency_id: agencyData._id,
		};
	} catch (error) {
		throw new Error(`Error parsing fare attributes: ${error}`);
	}
}

/**
 * Parses fare rules data into GTFS fare_rules.txt format
 * @param agencyData - The agency data
 * @param routeData - The route data
 * @param fareData - The fare data
 * @returns The formatted fare rules row
 */
export function parseFareRules(
	agencyData: Agency,
	routeData: Route,
	fareData: Fare,
): GtfsTMLFareRules {
	try {
		return {
			fare_id: fareData.code,
			route_id: routeData.code,
			agency_id: agencyData._id,
		};
	} catch (error) {
		throw new Error(`Error parsing fare rules: ${error}`);
	}
}

/**
 * Exports fare rules for a route with its associated fares
 * @param agencyData - The agency data
 * @param lineData - The line data (contains fare IDs)
 * @param routeData - The route data
 * @param exportConfig - The export configuration
 * @param faresMap - Pre-fetched map of fares for performance
 * @param referencedFareIds - Set to track which fares are referenced
 */
export async function exportFareForRoute(
	agencyData: Agency,
	lineData: Line,
	routeData: Route,
	exportConfig: GtfsV29ExportConfig,
	faresMap: Map<string, Fare>,
	referencedFareIds: Set<string>,
) {
	// Export fare rules for prepaid fare if it exists
	if (lineData.prepaid_fare_id) {
		const fareData = faresMap.get(lineData.prepaid_fare_id);
		if (fareData) {
			const parsedFareRule = parseFareRules(agencyData, routeData, fareData);
			await exportConfig.writers.fare_rules.write(parsedFareRule);
			referencedFareIds.add(lineData.prepaid_fare_id);
		}
	}

	// Export fare rules for onboard fares if they exist
	if (lineData.onboard_fare_ids && lineData.onboard_fare_ids.length > 0) {
		for (const fareId of lineData.onboard_fare_ids) {
			const fareData = faresMap.get(fareId);
			if (fareData) {
				const parsedFareRule = parseFareRules(agencyData, routeData, fareData);
				await exportConfig.writers.fare_rules.write(parsedFareRule);
				referencedFareIds.add(fareId);
			}
		}
	}
}

/**
 * Exports fare attributes for all referenced fares
 * @param agencyData - The agency data
 * @param exportConfig - The export configuration
 * @param faresMap - Pre-fetched map of fares
 * @param referencedFareIds - Set of fare IDs that were referenced
 */
export async function exportFareAttributes(
	agencyData: Agency,
	exportConfig: GtfsV29ExportConfig,
	faresMap: Map<string, Fare>,
	referencedFareIds: Set<string>,
) {
	for (const fareId of referencedFareIds) {
		const fareData = faresMap.get(fareId);
		if (fareData) {
			const parsedFareAttributes = parseFareAttributes(agencyData, fareData);
			await exportConfig.writers.fare_attributes.write(parsedFareAttributes);
		}
	}
}
