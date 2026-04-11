/* * */

/**
 * Determines the appropriate ClickHouse parameter type based on the value's JavaScript type.
 * This is used to convert untyped query placeholders into typed ClickHouse parameters.
 * @param value
 * @returns
 */
export function getClickHouseParamType(value: number | string): 'Float64' | 'Int64' | 'String' {
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) {
			throw new Error('CLICKHOUSE: Query params do not support non-finite numbers.');
		}
		return Number.isInteger(value) ? 'Int64' : 'Float64';
	}
	return 'String';
}
