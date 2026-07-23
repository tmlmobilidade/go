/* * */

import { SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { Stop } from '@tmlmobilidade/types';

/* * */

export const stopsIndexes: SimplifiedMongoIndex<Stop>[] = [
	{ key: { district_id: 1 } },
	{ key: { municipality_id: 1 } },
	{ key: { 'flags.agency_ids': 1 } },
];
