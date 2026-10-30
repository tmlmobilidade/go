import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Changelog } from '@tmlmobilidade/go-types-core';

/* * */

export const changelogsIndexes: SimplifiedMongoIndex<Changelog>[] = [
	{ key: [['publish_status', 1], ['created_at', -1], ['_id', -1]] },
];
