/* * */

import { type Row } from '../types.js';

/* * */

/**
 * Returns the value of the given field in the given row.
 * @param row - The row to get the value from.
 * @param field - The field to get the value from.
 * @returns The value of the given field in the given row.
 */
export function required(row: Row, field: string): string {
	const value = row[field];
	if (!value) throw new Error(`Missing ${field} in ${JSON.stringify(row)}`);
	return value;
}

/**
 * Converts a string to a number.
 * @param value - The string to convert.
 * @returns The number of the given string.
 */
export function number(value: string | undefined): number | undefined {
	return value === undefined || value === '' ? undefined : Number(value);
}

/**
 * Picks the given fields from the given row.
 * @param row - The row to pick the fields from.
 * @param fields - The fields to pick.
 * @returns A new row with the picked fields.
 */
export function pick(row: Row, fields: string[]): Row {
	return Object.fromEntries(fields.map(field => [field, row[field] ?? '']));
}

/**
 * Returns the row with the given ID from the given map.
 * @param rows - The map to get the row from.
 * @param id - The ID of the row to get.
 * @param table - The table the row is from.
 * @returns The row with the given ID from the given map.
 */
export function referenced<T>(rows: Map<string, T>, id: string, table: string): T {
	const row = rows.get(id);
	if (row === undefined) throw new Error(`Missing ${table} "${id}"`);
	return row;
}
