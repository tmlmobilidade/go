/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { Vehicle } from '@tmlmobilidade/types';

/* * */

export const vehiclesIndexes: SimplifiedMongoIndex<Vehicle>[] = [
	{ key: { agency_id: 1 } },
];
