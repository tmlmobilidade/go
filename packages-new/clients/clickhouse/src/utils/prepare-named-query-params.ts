/* * */

import { getClickHouseParamType } from './get-clickhouse-param-type.js';
import { validateSqlParam } from './validate-sql-param.js';

/**
 * Prepares a SQL query with named parameters by validating the parameter keys
 * and ensuring that all provided parameters are used in the query. It also converts untyped
 * placeholders (e.g., {name}) into typed ClickHouse parameters (e.g., {name:Type}) based on
 * the value type. This function is essential for safely constructing SQL queries with dynamic
 * parameters while preventing SQL injection vulnerabilities.
 * @param query The SQL query string containing named parameters in the format {paramName} or {paramName:Type}.
 * @param params An optional object mapping parameter names to their values. The keys must be valid SQL parameter names.
 * @param context An optional string providing context for error messages (e.g., the name of the query or operation).
 * @throws Will throw an error if any parameter key is invalid, if there are missing parameters required by the query, or if there are unused parameters provided.
 * @returns An object containing the normalized query string with typed parameters and a mapping of parameter names to their values.
 */
export function prepareNamedQueryParams(query: string, params?: Record<string, number | string>, context?: string): { query: string, queryParams: Record<string, number | string> } {
	const queryParams: Record<string, number | string> = {};
	const providedParams = params ?? {};
	const usedKeys = new Set<string>();

	for (const key of Object.keys(providedParams)) {
		validateSqlParam(key);
	}

	// Backward compatibility: convert untyped placeholders ({name}) into typed ClickHouse params.
	const normalizedQuery = query.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key: string) => {
		if (!(key in providedParams)) {
			throw new Error(`CLICKHOUSE "${context ?? 'query'}": Missing query param: ${key}`);
		}

		usedKeys.add(key);
		const value = providedParams[key];
		queryParams[key] = value;

		return `{${key}:${getClickHouseParamType(value)}}`;
	});

	// Also include explicitly typed placeholders already present in query (e.g. {id:UInt64}).
	for (const match of normalizedQuery.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*):[^}]+\}/g)) {
		const key = match[1];
		if (!(key in providedParams)) {
			throw new Error(`CLICKHOUSE "${context ?? 'query'}": Missing query param: ${key}`);
		}
		usedKeys.add(key);
		queryParams[key] = providedParams[key];
	}

	for (const key of Object.keys(providedParams)) {
		if (!usedKeys.has(key)) {
			throw new Error(`CLICKHOUSE "${context ?? 'query'}": Unused query param: ${key}`);
		}
	}

	return { query: normalizedQuery, queryParams };
}
