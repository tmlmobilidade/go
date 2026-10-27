import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type OperationalBanner } from '@tmlmobilidade/go-types-core';

/* * */

export const bannersIndexes: SimplifiedMongoIndex<OperationalBanner>[] = [
	{ key: [['status', 1], ['published_at', -1]] },
];
