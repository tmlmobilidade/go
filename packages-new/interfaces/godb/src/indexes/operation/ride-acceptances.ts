/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { RideAcceptance } from '@tmlmobilidade/types';

/* * */

export const rideAcceptancesIndexes: SimplifiedMongoIndex<RideAcceptance>[] = [
	{ key: { ride_id: 1 }, unique: true },
];
