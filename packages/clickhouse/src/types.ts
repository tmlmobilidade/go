/**
 * Supported ClickHouse data types
 */
export type ClickHouseType =
  | 'Bool'
  | 'Boolean' | 'Date32' | 'Date' | 'DateTime' | 'Decimal' | 'Float32'
  | 'Float64' | 'Int8' | 'Int16' | 'Int32' | 'Int64' | 'Int128'
  | 'Int256' | 'String'
  | 'UInt8' | 'UInt16'
  | 'UInt32' | 'UInt64'
  | 'UInt128' | 'UInt256' | 'UUID' | `Array(${string})`
  | `DateTime64(${number})`
  | `Decimal(${number}, ${number})`
  | `Enum8(${string})`
  | `Enum16(${string})`
  | `FixedString(${number})`
  | `LowCardinality(${string})` | `Map(${string}, ${string})`
  | `Nullable(${string})`;

/**
 * Definition of a ClickHouse column,
 * including its name, type, and various optional properties.
 */
export interface ClickHouseColumn<T> {
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

	name: Extract<keyof T, string>

	/** Whether the column can be null (wraps type in Nullable) */
	nullable?: boolean

	/** Include this column in the ORDER BY clause (ClickHouse's primary index) */
	primaryKey?: boolean

	/** Order of this column in the primary key (lower = first). Default: 0 */
	primaryKeyOrder?: number

	/** TTL expression for this column */
	ttl?: string

	/** The ClickHouse data type */
	type: ClickHouseType
}

/**
 * Definition for allowed ClickHouse table engines.
 * Please avoid using other engines before consulting with the team.
 * Only `ReplicatedMergeTree` supports automatic replication.
 */
export type ClickHouseTableEngine = 'ReplicatedMergeTree';
