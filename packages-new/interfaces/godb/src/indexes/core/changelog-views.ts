import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type ChangelogView } from '@tmlmobilidade/go-types-core';

/* * */

export const changelogViewsIndexes: SimplifiedMongoIndex<ChangelogView>[] = [
	{ key: [['user_id', 1], ['release_id', 1]], unique: true },
];
