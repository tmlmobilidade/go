/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedStop } from '@tmlmobilidade/go-types-infrastructure';

/* * */

export const simplifiedStopTableSchema: ClickHouseTableSchema<SimplifiedStop> = {
	_id: { type: 'UUID' },
	created_at: { type: 'UInt64' },
	is_deleted: { type: 'Bool' },
	latitude: { type: 'Float64' },
	legacy_ids: { type: 'Array(LowCardinality(String))' },
	lifecycle_status: { type: 'String' },
	location_country_admin_level: { type: 'UInt8' },
	location_country_name: { type: 'String' },
	location_country_osm_id: { type: 'UInt64' },
	location_neighbourhood_admin_level: { type: 'UInt8' },
	location_neighbourhood_name: { type: 'String' },
	location_neighbourhood_osm_id: { type: 'UInt64' },
	location_primary_admin_level: { type: 'UInt8' },
	location_primary_code: { type: 'String' },
	location_primary_name: { type: 'String' },
	location_primary_osm_id: { type: 'UInt64' },
	location_secondary_admin_level: { type: 'UInt8' },
	location_secondary_code: { type: 'String' },
	location_secondary_name: { type: 'String' },
	location_secondary_osm_id: { type: 'UInt64' },
	location_tertiary_admin_level: { type: 'UInt8' },
	location_tertiary_code: { type: 'String' },
	location_tertiary_name: { type: 'String' },
	location_tertiary_osm_id: { type: 'UInt64' },
	longitude: { type: 'Float64' },
	name: { type: 'String' },
	short_name: { type: 'String' },
	updated_at: { type: 'UInt64' },
};
