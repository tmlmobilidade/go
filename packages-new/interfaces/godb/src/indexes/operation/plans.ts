/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Plan } from '@tmlmobilidade/go-types-operation';

/* * */

export const plansIndexes: SimplifiedMongoIndex<Plan>[] = [
	{ key: { agency_id: 1 } },
];
