/* * */

import { type LoggerColumn } from '../types/types.js';

/* * */

/**
 * Formats a set of columns (strings or LoggerColumn objects) into a single padded string.
 *
 * Each item in `columns` can be:
 *  - A string: included as-is.
 *  - A LoggerColumn: padded/truncated based on `c` (column width), content `t`, and alignment `a` ('left' or 'right').
 *
 * If `a` is 'right', pads the value on the left (right-aligned). Default is left-aligned.
 *
 * @param columns Array of LoggerColumn objects or strings to format.
 * @returns The formatted string with each value padded to its column definition.
 */
export function formatColumns(columns: (LoggerColumn | string)[]): string {
	return columns
		.map((item) => {
			if (typeof item === 'string') return item;
			if (!item.c) return String(item.t);
			if (item.a === 'right') return String(item.t).padStart(item.c);
			return String(item.t).padEnd(item.c);
		})
		.join('');
}
