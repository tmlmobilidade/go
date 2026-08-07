/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Plan } from '@tmlmobilidade/types';

/* * */

export const plansIndexes: SimplifiedMongoIndex<Plan>[] = [
	{ key: { agency_id: 1 } },
];
