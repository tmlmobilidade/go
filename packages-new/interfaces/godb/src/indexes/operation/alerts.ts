/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Alert } from '@tmlmobilidade/types';

/* * */

export const alertsIndexes: SimplifiedMongoIndex<Alert>[] = [
	{ key: { created_at: -1 } },
	{ key: { created_by: 1 } },
];
