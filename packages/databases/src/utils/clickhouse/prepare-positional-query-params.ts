/* * */

import { getClickHouseParamType } from '@/utils/clickhouse/get-clickhouse-param-type.js';

/**
 * Prepares a SQL query with positional parameters by replacing placeholders
 * in the format of $1, $2, etc., with ClickHouse's named parameter syntax.
 * It also validates that all provided parameters are used in the query and that their keys are valid.
 * @param query The SQL query containing positional placeholders (e.g., $1, $2).
 * @param params An optional object mapping parameter indices (as strings) to their values.
 * @throws Will throw an error if a placeholder is missing a corresponding parameter, if there are unused parameters, or if any parameter keys are invalid.
 * @returns An object containing the transformed query and a mapping of named parameters to their values.
 */
export function preparePositionalQueryParams(query: string, params?: Record<string, number | string>): { query: string, query_params: Record<string, number | string> } {
	const queryParams: Record<string, number | string> = {};
	const providedParams = params ?? {};
	const usedKeys = new Set<string>();

	const normalizedQuery = query.replace(/\$(\d+)/g, (_, index: string) => {
		const key = String(index);
		if (!(key in providedParams)) {
			throw new Error(`CLICKHOUSE "${query}": Missing query param: $${key}`);
		}

		usedKeys.add(key);
		const queryParamKey = `p${key}`;
		const value = providedParams[key];
		queryParams[queryParamKey] = value;

		return `{${queryParamKey}:${getClickHouseParamType(value)}}`;
	});

	for (const key of Object.keys(providedParams)) {
		if (!/^\d+$/.test(key)) {
			throw new Error(`CLICKHOUSE "${query}": Invalid positional query param key: "${key}"`);
		}
		if (!usedKeys.has(key)) {
			throw new Error(`CLICKHOUSE "${query}": Unused query param: $${key}`);
		}
	}

	return { query: normalizedQuery, query_params: queryParams };
}
