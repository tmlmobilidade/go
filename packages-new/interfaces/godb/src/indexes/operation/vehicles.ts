/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Vehicle } from '@tmlmobilidade/types';

/* * */

export const vehiclesIndexes: SimplifiedMongoIndex<Vehicle>[] = [
	{ key: { agency_id: 1 } },
];
