/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';

/* * */

export const vehiclesIndexes: SimplifiedMongoIndex<Vehicle>[] = [
	{ key: { agency_id: 1 } },
];
