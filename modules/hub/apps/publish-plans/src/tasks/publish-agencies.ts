/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { type HubV1ApiAgency, HubV1ApiAgencySchema } from '@tmlmobilidade/go-types-hub';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

export async function publishAgencies(organization?: Organization) {
	//

	Logger.title('Publishing agencies JSON feed...');

	const globalTimer = new Timer();

	//
	// Retrieve agencies

	const allAgenciesData = await goDb.core.agencies.findMany(organization ? { _id: { $in: organization.agency_ids } } : {});

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
				positions_enabled: agencyData.open_data.services.positions_enabled,
				service_alerts_enabled: agencyData.open_data.services.service_alerts_enabled,
			},
			timezone: agencyData.timezone,
			website_url: agencyData.open_data.details.website_url,
		});
	});

	//
	// Save the result in API Cache

	await cacheDb.setNew(organization ? `hub:v1:${organization._id}:agencies:json` : 'hub:v1:agencies:json', parsedAgencies);

	Logger.success(`Finished publishing ${parsedAgencies.length} agencies JSON feed. (${globalTimer.get()})`);
};
