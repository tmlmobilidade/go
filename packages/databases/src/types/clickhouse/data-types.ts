/**
 * Supported ClickHouse data types that
 * can be used in ClickHouse table schemas.
 */
export type ClickHouseDataType =
  | 'Bool'
  | 'Date'
  | 'Float32'
  | 'Float64'
  | 'Int32'
  | 'Int64'
  | 'String'
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt64'
  | 'UUID'
  | `DateTime64(3, 'UTC') CODEC(Delta, ZSTD)`
  | `Enum8(${string})`
  | `FixedString(${number})`
  | `LowCardinality(Nullable(String))`
  | `LowCardinality(String)`
  | `Nullable(Float64)`
  | `Nullable(Int32)`
  | `Nullable(Int64)`
  | `Nullable(String)`
  | `Nullable(UInt16)`
  | `Nullable(UInt32)`
  | `Nullable(UInt64)`
  | `Nullable(UUID)`;
