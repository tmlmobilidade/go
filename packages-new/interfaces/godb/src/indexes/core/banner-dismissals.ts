import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type BannerDismissal } from '@tmlmobilidade/go-types-core';

/* * */

export const bannerDismissalsIndexes: SimplifiedMongoIndex<BannerDismissal>[] = [
	{ key: [['user_id', 1], ['banner_id', 1]], unique: true },
];
