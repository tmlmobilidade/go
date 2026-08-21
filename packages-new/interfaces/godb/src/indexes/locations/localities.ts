/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Locality } from '@tmlmobilidade/go-types-locations';

/* * */

export const localitiesIndexes: SimplifiedMongoIndex<Locality>[] = [
	{ key: { geometry: '2dsphere' } },
	{ key: { 'properties.name': 'text' } },
];
