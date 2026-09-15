/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { GtfsStrictV30AgencySchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportAgencyFile(context: OperationPostersV1Context, planData: Plan) {
	//
	// Export agency file

	const agency = await goDb.core.agencies.findById(planData.agency_id);
	if (!agency) throw new Error(`Agency ${planData.agency_id} not found for poster export.`);

	const data = GtfsStrictV30AgencySchema.parse({
		agency_email: agency.open_data?.details?.email,
		agency_fare_url: agency.open_data?.details?.fare_url,
		agency_id: agency.code,
		agency_lang: agency.primary_language,
		agency_name: agency.name,
		agency_phone: agency.open_data?.details?.phone,
		agency_timezone: agency.timezone,
		agency_url: agency.open_data?.details?.website_url,
	});
	await context.writers.agency.write({ ...data, agency_code: agency.code });

	await context.writers.agency.flush();
	await yieldToEventLoop();

	Logger.info({ message: 'Exported agency.txt file.' });
}
