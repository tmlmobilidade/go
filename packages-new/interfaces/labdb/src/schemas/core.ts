/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedAgency } from '@tmlmobilidade/go-types-core';

/* * */

export const simplifiedAgenciesTableSchema: ClickHouseTableSchema<SimplifiedAgency> = {
	_id: { type: 'String' },
	code: { type: 'String' },
	created_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	name: { type: 'String' },
	primary_language: { type: 'String' },
	pta_name: { type: 'String' },
	short_name: { type: 'String' },
	timezone: { type: 'String' },
	updated_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
};
