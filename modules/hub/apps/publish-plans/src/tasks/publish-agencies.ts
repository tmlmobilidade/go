/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HubV1ApiAgency, HubV1ApiAgencySchema } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishAgencies() {
	//

	Logger.title('Publishing agencies JSON feed...');

	const globalTimer = new Timer();

	//
	// Retrieve all plans

	const allAgenciesData = await goDb.core.agencies.findMany();

	Logger.info({ message: `Retrieved ${allAgenciesData.length} agencies...` });

	//
	// Parse the agencies into the Hub V1 API schema

	const parsedAgencies: HubV1ApiAgency[] = allAgenciesData.map((agencyData) => {
		return HubV1ApiAgencySchema.parse({
			_id: agencyData._id,
			code: agencyData.code,
			email: agencyData.open_data.details.email,
			fare_url: agencyData.open_data.details.fare_url,
			name: agencyData.open_data.details.name,
			phone: agencyData.open_data.details.phone,
			primary_language: agencyData.primary_language,
			services: {
				eta_enabled: agencyData.open_data.services.eta_enabled,
				gtfs_enabled: agencyData.open_data.services.gtfs_enabled,
				positions_enabled: agencyData.open_data.services.positions_enabled,
				service_alerts_enabled: agencyData.open_data.services.service_alerts_enabled,
			},
			timezone: agencyData.timezone,
			website_url: agencyData.open_data.details.website_url,
		});
	});

	//
	// Save the result in API Cache

	await cacheDb.setNew('hub:v1:agencies:json', parsedAgencies);

	Logger.success(`Finished publishing ${parsedAgencies.length} agencies JSON feed. (${globalTimer.get()})`);
};
