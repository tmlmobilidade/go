/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmlCmAlsaV1, type RawVehicleEventPtTmlCmRlV1, type RawVehicleEventPtTmlCmTstV1, type RawVehicleEventPtTmlCmVaV1 } from '@tmlmobilidade/go-types-vehicle-events';
import crypto from 'node:crypto';

/* * */

const AGENCY_ID_MAP = [
	{ agency_code: '41', agency_id: 'LA77N', version: 'pt-tml-cm-va-v1' },
	{ agency_code: '42', agency_id: 'BNA17', version: 'pt-tml-cm-rl-v1' },
	{ agency_code: '43', agency_id: 'YA15B', version: 'pt-tml-cm-tst-v1' },
	{ agency_code: '44', agency_id: 'A2L1N', version: 'pt-tml-cm-alsa-v1' },
] as const;

/* * */

export function transformPcgiVehicleEventCore(pcgiVehicleEvent): (RawVehicleEventPtTmlCmAlsaV1 | RawVehicleEventPtTmlCmRlV1 | RawVehicleEventPtTmlCmTstV1 | RawVehicleEventPtTmlCmVaV1)[] {
	//

	const result: (RawVehicleEventPtTmlCmAlsaV1 | RawVehicleEventPtTmlCmRlV1 | RawVehicleEventPtTmlCmTstV1 | RawVehicleEventPtTmlCmVaV1)[] = [];

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of pcgiVehicleEvent.content.entity ?? []) {
		//

		//
		// Skip entities that do not have a vehicle field,
		// as they are not relevant for our use case.

		if (!entity.vehicle) continue;

		//
		// Map the agency code to the agency id

		const matchingAgency = AGENCY_ID_MAP.find(agency => agency.agency_code === String(entity.vehicle.agencyId));

		if (!matchingAgency) continue;

		//
		// Hash the relevant fields of the vehicle event
		// to create a unique identifier for the event.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database.

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmlCmAlsaV1 | RawVehicleEventPtTmlCmRlV1 | RawVehicleEventPtTmlCmTstV1 | RawVehicleEventPtTmlCmVaV1> = {
			agency_id: matchingAgency.agency_id,
			created_at: Dates.fromSeconds(entity.vehicle.timestamp).unix_timestamp,
			entity_id: entity._id,
			payload: {
				header: pcgiVehicleEvent.content.header,
				vehicle: entity.vehicle,
			},
			version: matchingAgency.version,
		};

		const hashableRawEventId = crypto
			.createHash('sha256')
			.update(JSON.stringify(hashableRawEvent))
			.digest('hex');

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection

		result.push({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.fromUnixTimestamp(pcgiVehicleEvent.millis).unix_timestamp,
		} as typeof result[number]);

		//
	}

	return result;

	//
};
