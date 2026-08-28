/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Municipality } from '@tmlmobilidade/go-types-locations';

/* * */

export const municipalitiesIndexes: SimplifiedMongoIndex<Municipality>[] = [
	{ key: { geometry: '2dsphere' } },
	{ key: { 'properties.name': 'text' } },
];
