/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

/* * */

export const stopsIndexes: SimplifiedMongoIndex<Stop>[] = [
	{ key: { district_id: 1 } },
	{ key: { 'locations.country.osm_id': 1 } },
	{ key: { 'locations.neighbourhood.osm_id': 1 } },
	{ key: { 'locations.primary.osm_id': 1 } },
	{ key: { 'locations.tertiary.osm_id': 1 } },
	{ key: { 'locations.secondary.osm_id': 1 } },
	{ key: { 'flags.agency_ids': 1 } },
];
