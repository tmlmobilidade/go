/* * */

import { type ClickHouseDataType } from '@/types/clickhouse/data-types.js';

/**
 * Definition of a ClickHouse column,
 * including its name, type, and various optional properties.
 */
export interface ClickHouseColumn {

	/** Alias expression (computed on read) */
	alias?: string

	/** Column codec for compression */
	codec?: string

	/** Comment for the column */
	comment?: string

	/** Default value expression */
	default?: string

	/** Create a secondary index (skipping index) on this column */
	indexed?: boolean

	/** Granularity for the index. Default: 4 */
	indexGranularity?: number

	/** Type of skipping index. Default: 'minmax' */
	indexType?: 'bloom_filter' | 'minmax' | 'ngrambf_v1' | 'set' | 'tokenbf_v1'

	/** Use LowCardinality wrapper for low-cardinality strings */
	lowCardinality?: boolean

	/** Materialized value expression (computed on insert) */
	materialized?: string

	/** Whether the column can be null (wraps type in Nullable) */
	nullable?: boolean

	/** Include this column in the ORDER BY clause (ClickHouse's primary index) */
	primaryKey?: boolean

	/** Order of this column in the primary key (lower = first). Default: 0 */
	primaryKeyOrder?: number

	/** TTL expression for this column */
	ttl?: string

	/** The ClickHouse data type */
	type: ClickHouseDataType

}

/**
 * A ClickHouse schema is a mapping of column names to their definitions (ClickHouseColumn).
 * The generic type T represents the shape of the data, and the keys of T are used as column names.
 */
export type ClickHouseSchema<T extends object> = {
	[K in keyof T]: ClickHouseColumn
};
