/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { HashedTrip } from '@tmlmobilidade/types';

/* * */

export const hashedTripsIndexes: SimplifiedMongoIndex<HashedTrip>[] = [
	{ key: { agency_id: 1 } },
	{ key: { line_id: 1 } },
	{ key: { agency_id: 1, trip_headsign: 1 } },
];
