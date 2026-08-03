/**
 * Supported ClickHouse data types that
 * can be used in ClickHouse table schemas.
 */
export type ClickHouseDataType =
  | 'Array(LowCardinality(String))'
  | 'Bool'
  | 'Date'
  | 'Float32'
  | 'Float32 CODEC(Gorilla, ZSTD)'
  | 'Float64'
  | 'Int32'
  | 'Int64'
  | 'Int64 CODEC(DoubleDelta, ZSTD)'
  | 'LowCardinality(Nullable(String))'
  | 'LowCardinality(String)'
  | 'Nullable(Float64)'
  | 'Nullable(Int32)'
  | 'Nullable(Int64)'
  | 'Nullable(Int64) CODEC(DoubleDelta, ZSTD)'
  | 'Nullable(String)'
  | 'Nullable(UInt8) CODEC(T64, ZSTD)'
  | 'Nullable(UInt16)'
  | 'Nullable(UInt16) CODEC(T64, ZSTD)'
  | 'Nullable(UInt32)'
  | 'Nullable(UInt32) CODEC(T64, ZSTD)'
  | 'Nullable(UInt64)'
  | 'Nullable(UUID)'
  | 'String'
  | 'String CODEC(ZSTD)'
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt32 CODEC(T64, ZSTD)'
  | 'UInt64'
  | 'UUID'
  | `DateTime64(3, 'UTC') CODEC(Delta, ZSTD)`
  | `Enum8(${string})`
  | `FixedString(${number})`;
