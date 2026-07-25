/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type RawVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export const vehicleEventsIndexes: SimplifiedMongoIndex<RawVehicleEvent>[] = [
	{ key: { created_at: 1 } },
	{ key: { agency_id: 1, created_at: 1 } },
	// eslint-disable-next-line perfectionist/sort-objects
	{ key: { version_id: 1, created_at: 1 } },
	// eslint-disable-next-line perfectionist/sort-objects
	{ key: { version_id: 1, received_at: 1 } },
];
