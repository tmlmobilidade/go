/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';

/* * */

interface DateRangeQuery {
	end_date?: string
	start_date?: string
}

interface ParseIdsOptions {
	max_ids?: number
	parameter_name: string
}

/* * */

/**
 * Parse optional singular, plural, comma-separated, or repeated ID query
 * parameters into one de-duplicated list.
 */
export function parseIds(
	values: Array<string | string[] | undefined>,
	options: ParseIdsOptions,
) {
	const providedValues = values
		.filter(value => value !== undefined)
		.flatMap(value => Array.isArray(value) ? value : [value]);

	if (providedValues.length === 0) return undefined;

	const ids = [...new Set(
		providedValues
			.flatMap(value => value?.split(',') ?? [])
			.map(value => value.trim())
			.filter(Boolean),
	)];

	if (ids.length === 0) {
		throw new HttpException(
			HTTP_STATUS.BAD_REQUEST,
			`${options.parameter_name} must contain at least one ID`,
		);
	}

	if (options.max_ids !== undefined && ids.length > options.max_ids) {
		throw new HttpException(
			HTTP_STATUS.BAD_REQUEST,
			`${options.parameter_name} cannot contain more than ${options.max_ids} IDs`,
		);
	}

	return ids;
}

/**
 * Convert a supported API date into an inclusive operational-date boundary.
 */
export function parseDateBoundary(
	value: string | undefined,
	boundary: 'end' | 'start',
) {
	if (value === undefined) return undefined;

	const normalized = value.split('T')[0];
	let year: number;
	let month: number;
	let day: number;

	if (/^\d{4}$/.test(normalized)) {
		year = Number(normalized);
		month = boundary === 'start' ? 1 : 12;
		day = boundary === 'start' ? 1 : 31;
	} else if (/^\d{4}-\d{2}$/.test(normalized)) {
		[year, month] = normalized.split('-').map(Number) as [number, number];
		if (month < 1 || month > 12) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, `${boundary}_date contains an invalid month`);
		}
		day = boundary === 'start'
			? 1
			: new Date(Date.UTC(year, month, 0)).getUTCDate();
	} else if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
		[year, month, day] = normalized.split('-').map(Number) as [number, number, number];
		const parsed = new Date(Date.UTC(year, month - 1, day));
		if (
			parsed.getUTCFullYear() !== year
			|| parsed.getUTCMonth() !== month - 1
			|| parsed.getUTCDate() !== day
		) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, `${boundary}_date is invalid`);
		}
	} else {
		throw new HttpException(
			HTTP_STATUS.BAD_REQUEST,
			`${boundary}_date must use YYYY, YYYY-MM, or YYYY-MM-DD format`,
		);
	}

	return year * 10_000 + month * 100 + day;
}

/**
 * Parse and validate an optional inclusive date range.
 */
export function parseDateRange(query: DateRangeQuery) {
	const startDate = parseDateBoundary(query.start_date, 'start');
	const endDate = parseDateBoundary(query.end_date, 'end');

	if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'start_date must not be after end_date');
	}

	return {
		end_date: endDate,
		start_date: startDate,
	};
}
