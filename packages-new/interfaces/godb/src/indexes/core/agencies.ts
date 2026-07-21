/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { Agency } from '@tmlmobilidade/types';

/* * */

export const agenciesIndexes: SimplifiedMongoIndex<Agency>[] = [
	{ key: { name: 1 }, unique: true },
	{ key: { code: 1 }, unique: true },
	{ key: { email: 1 }, unique: true },
];
