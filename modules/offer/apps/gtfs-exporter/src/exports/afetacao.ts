/* eslint-disable perfectionist/sort-objects */
/* * */

import { type ExportedAfetacaoRow, type GtfsV29ExportConfig } from '@/types.js';
import { type Agency, type Fare, type Line, type Pattern, type Typology, type Zone } from '@tmlmobilidade/types';

import { getAgencyStopId } from '../utils/get-agency-stop-id.js';

/* * */

/**
 * Parses zoning/afetacao data into afetacao.csv format
 * @param agencyData - The agency data
 * @param lineData - The line data
 * @param patternData - The pattern data
 * @param allZonesMap - Map of zone ID to Zone object
 * @param allFaresMap - Map of fare ID to Fare object
 * @param typologyData - The typology data for this line
 * @param exportConfig - The export configuration
 * @returns Array of formatted afetacao rows
 */
export async function parseZoning(
	agencyData: Agency,
	lineData: Line,
	patternData: Pattern,
	allZonesMap: Map<string, Zone>,
	allFaresMap: Map<string, Fare>,
	typologyData: null | Typology,
	exportConfig: GtfsV29ExportConfig,
): Promise<ExportedAfetacaoRow[]> {
	try {
		const parsedZoning: ExportedAfetacaoRow[] = [];

		if (!patternData.path) {
			return parsedZoning;
		}

		// Get prepaid fare code
		let prepaidFareCode = '';
		let prepaidFarePrice = '0';
		if (lineData.prepaid_fare_id) {
			const prepaidFare = allFaresMap.get(lineData.prepaid_fare_id);
			if (prepaidFare) {
				prepaidFareCode = prepaidFare.code;
				prepaidFarePrice = prepaidFare.price ? String(prepaidFare.price * 100) : '0';
			}
		}

		// Get onboard fare codes
		const onboardFareCodes: string[] = [];
		if (lineData.onboard_fare_ids && lineData.onboard_fare_ids.length > 0) {
			for (const fareId of lineData.onboard_fare_ids) {
				const fare = allFaresMap.get(fareId);
				if (fare) {
					onboardFareCodes.push(fare.code);
				}
			}
		}
		const formattedOnboardFares = onboardFareCodes.join('|');

		// Get typology code
		const typologyCode = typologyData?.code || '';

		for (const [pathIndex, pathData] of patternData.path.entries()) {
			// Skip if this pathStop has no associated stop
			if (!pathData.stop) continue;

			// Get zones for this specific stop from the pattern path
			const stopZones: Zone[] = [];
			if (pathData.zones && pathData.zones.length > 0) {
				for (const zoneId of pathData.zones) {
					const zone = allZonesMap.get(zoneId);
					if (zone) {
						stopZones.push(zone);
					}
				}
			}

			// Format zones in pipe-separated format
			const formattedZoneNames = stopZones.map(zone => zone.name).join('|');
			const formattedZoneCodes = stopZones.map(zone => zone.code).join('|');

			// Use agency-specific stop_id
			const agencyId = agencyData._id;
			const stopId = getAgencyStopId(pathData.stop, agencyId);

			// Build the afetacao entry
			parsedZoning.push({
				operator_id: agencyData._id,
				line_id: lineData.code,
				line_type: typologyCode,
				pattern_id: patternData.code,
				stop_id: stopId,
				stop_name: pathData.stop.name || '',
				stop_sequence: pathIndex + exportConfig.stop_sequence_start,
				accepted_zone_codes: formattedZoneCodes,
				accepted_zone_names: formattedZoneNames,
				onboard_fares: formattedOnboardFares,
				prepaid_fare: prepaidFareCode,
				prepaid_fare_price: prepaidFarePrice,
				interchange: lineData.interchange ? '1' : '0',
			});
		}

		return parsedZoning;
	} catch (error) {
		throw new Error(`Error parsing zoning for pattern ${patternData.code}: ${error}`);
	}
}

/**
 * Exports zoning/afetacao data to afetacao.csv
 * @param agencyData - The agency data
 * @param lineData - The line data
 * @param patternData - The pattern data
 * @param allZonesMap - Map of zone ID to Zone object
 * @param allFaresMap - Map of fare ID to Fare object
 * @param typologyData - The typology data for this line
 * @param exportConfig - The export configuration
 */
export async function exportZoning(
	agencyData: Agency,
	lineData: Line,
	patternData: Pattern,
	allZonesMap: Map<string, Zone>,
	allFaresMap: Map<string, Fare>,
	typologyData: null | Typology,
	exportConfig: GtfsV29ExportConfig,
) {
	const parsedZoning = await parseZoning(agencyData, lineData, patternData, allZonesMap, allFaresMap, typologyData, exportConfig);
	await exportConfig.writers.afetacao.write(parsedZoning);
}
