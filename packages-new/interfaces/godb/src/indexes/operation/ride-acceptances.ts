/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type RideAcceptance } from '@tmlmobilidade/types';

/* * */

export const rideAcceptancesIndexes: SimplifiedMongoIndex<RideAcceptance>[] = [
	{ key: { ride_id: 1 }, unique: true },
];
