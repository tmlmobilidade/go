/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type PublicFeedback } from '@tmlmobilidade/go-types-hub';

/* * */

export const publicFeedbackTableSchema: ClickHouseTableSchema<PublicFeedback> = {
	agency_id: { type: 'Nullable(String)' },
	created_at: { type: 'UInt64' },
	entity_id: { type: 'String' },
	entity_type: { type: 'Enum8(\'line\' = 1, \'stop\' = 2)' },
	mood: { type: 'Enum8(\'happy\' = 1, \'unhappy\' = 2)' },
	reasons: { type: 'Array(String)' },
	schema_version: { type: 'LowCardinality(String)' },
};
