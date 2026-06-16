import { type LoggerColumn } from '../types/types.js';

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
