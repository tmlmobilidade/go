/* eslint-disable perfectionist/sort-objects */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedFareAttributesRow {
	agency_id: string
	currency_type: string
	fare_id: string
	payment_method: string
	price: number
	transfers: string
}

interface FareAttributeObjApiResponse {
	currency_type: string
	fare_id: string
	payment_method: string
	price: number
	transfers: string
}

/**
 * Export the fare_attributes.txt file.
 * @param context The export context.
 */
export async function exportFareAttributesFile(agencyIds: string[], context: ExportGtfsContext) {
	//

	//
	// Fetch dates from GO v1 API

	const allFareAttributesRes = await fetch('https://go.carrismetropolitana.pt/api/fares/public/attributes');
	const allFareAttributesData = await allFareAttributesRes.json() as FareAttributeObjApiResponse[];

	//
	// Parse and write dates

	for (const agencyId of agencyIds) {
		for (const fareAttributeData of allFareAttributesData) {
			const parsedFareAttributesRow: ExportedFareAttributesRow = {
				agency_id: agencyId,
				fare_id: `${agencyId}-${fareAttributeData.fare_id}`,
				price: fareAttributeData.price,
				payment_method: fareAttributeData.payment_method,
				currency_type: fareAttributeData.currency_type,
				transfers: fareAttributeData.transfers,
			};
			await context.writers.fare_attributes.write(parsedFareAttributesRow);
		}
	}

	await context.writers.fare_attributes.flush();

	Logger.info('Exported fare_attributes.txt file.');
}
