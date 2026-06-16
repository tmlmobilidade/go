/**
 * Supported ClickHouse data types that
 * can be used in ClickHouse table schemas.
 */
export type ClickHouseDataType =
  | 'Bool'
  | 'Date'
  | 'Float64'
  | 'Int64'
  | 'String'
  | 'UInt8'
  | 'UInt64'
  | `DateTime64(3, 'UTC') CODEC(Delta, ZSTD)`
  | `Enum8(${string})`
  | `LowCardinality(String)`
  | `Nullable(Float64)`
  | `Nullable(Int64)`
  | `Nullable(LowCardinality(String))`
  | `Nullable(String)`
  | `Nullable(UInt64)`;
