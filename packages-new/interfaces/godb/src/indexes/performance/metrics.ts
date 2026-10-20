/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type MetricDocument } from '@tmlmobilidade/go-types-performance';

/* * */

export const metricsIndexes: SimplifiedMongoIndex<MetricDocument>[] = [
	{ key: { metric: 1 } },
	{ key: { 'properties.agency_id': 1 } },
	{ key: { 'properties.line_id': 1 } },
	{ key: { 'properties.pattern_id': 1 } },
];
