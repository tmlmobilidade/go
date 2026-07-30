/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type District } from '@tmlmobilidade/types';

/* * */

export const districtsIndexes: SimplifiedMongoIndex<District>[] = [
	{ key: { geometry: '2dsphere' } },
];
