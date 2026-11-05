import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Banner } from '@tmlmobilidade/go-types-core';

/* * */

export const bannersIndexes: SimplifiedMongoIndex<Banner>[] = [
	{ key: [['publish_status', 1], ['created_at', -1]] },
];
