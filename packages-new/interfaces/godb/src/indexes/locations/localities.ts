/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { Locality } from '@tmlmobilidade/types';

/* * */

export const localitiesIndexes: SimplifiedMongoIndex<Locality>[] = [
	{ key: { geometry: '2dsphere' } },
	{ key: { 'properties.name': 'text' } },
];
