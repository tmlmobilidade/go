/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';

/* * */

export const demandByAgencyByOperationalDateTableSchema: ClickHouseTableSchema<DemandByAgencyByOperationalDate> = {
	agency_id: { type: 'LowCardinality(String)' },
	operational_date: { type: 'UInt32' },
	qty: { type: 'UInt64' },
	updated_at: { type: 'Int64' },
};
