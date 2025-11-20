/**
 * Date formatting utilities for metrics
 */

import { formatDayDetailed, formatDayShort } from '../formatDates';

/**
 * Format month string from YYYY-MM to readable format
 * @param monthStr Format: "YYYY-MM" (e.g., "2024-10")
 * @returns Formatted month string (e.g., "Out 2024")
 */
export function formatMonth(monthStr: string): string {
	const [year, month] = monthStr.split('-');
	const monthNumber = Number.parseInt(month, 10) - 1; // Convert to 0-based index
	const date = new Date(Number.parseInt(year), monthNumber, 1);

	// Use browser's locale or Portuguese as fallback
	const monthName = date.toLocaleDateString('pt-PT', { month: 'short' });
	return `${monthName} ${year}`;
}

/**
 * Format year string - for yearly data it's just the year
 * @param yearStr Format: "YYYY" (e.g., "2024")
 * @returns Formatted year string (same as input)
 */
export function formatYear(yearStr: string): string {
	return yearStr;
}

// Re-export day formatters for convenience
export { formatDayDetailed, formatDayShort };
