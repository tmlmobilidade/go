import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Banner } from '@tmlmobilidade/go-types-core';

/* * */

export const bannersIndexes: SimplifiedMongoIndex<Banner>[] = [
	{ key: [['status', 1], ['published_at', -1]] },
];
