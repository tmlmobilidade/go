/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { Plan } from '@tmlmobilidade/types';

/* * */

export const plansIndexes: SimplifiedMongoIndex<Plan>[] = [
	{ key: { 'gtfs_agency.agency_id': 'text' } },
];
