/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Parish } from '@tmlmobilidade/go-types-locations';

/* * */

export const parishesIndexes: SimplifiedMongoIndex<Parish>[] = [
	{ key: { geometry: '2dsphere' } },
	{ key: { 'properties.name': 'text' } },
];
