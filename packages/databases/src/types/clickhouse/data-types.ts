/**
 * Supported ClickHouse data types that
 * can be used in ClickHouse table schemas.
 */
export type ClickHouseDataType =
  | 'Bool'
  | 'Boolean'
  | 'Date32'
  | 'Date'
  | 'DateTime'
  | 'Decimal'
  | 'Float32'
  | 'Float64'
  | 'Int8'
  | 'Int16'
  | 'Int32'
  | 'Int64'
  | 'Int128'
  | 'Int256'
  | 'String'
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt64'
  | 'UInt128'
  | 'UInt256'
  | 'UUID'
  | `Array(${string})`
  | `DateTime64(${number})`
  | `Decimal(${number}, ${number})`
  | `Enum8(${string})`
  | `Enum16(${string})`
  | `FixedString(${number})`
  | `LowCardinality(${string})` | `Map(${string}, ${string})`
  | `Nullable(${string})`;
