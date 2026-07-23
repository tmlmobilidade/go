/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { Municipality } from '@tmlmobilidade/types';

/* * */

export const municipalitiesIndexes: SimplifiedMongoIndex<Municipality>[] = [
	{ key: { geometry: '2dsphere' } },
	{ key: { 'properties.name': 'text' } },
];
