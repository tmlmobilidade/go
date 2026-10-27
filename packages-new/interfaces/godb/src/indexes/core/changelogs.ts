import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type ChangelogRelease } from '@tmlmobilidade/go-types-core';

/* * */

export const changelogsIndexes: SimplifiedMongoIndex<ChangelogRelease>[] = [
	{ key: [['status', 1], ['published_at', -1], ['_id', -1]] },
];
