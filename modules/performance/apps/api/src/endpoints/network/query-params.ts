/* * */

import { parseDateRange, parseIds } from '@/endpoints/utils/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { parsePerformanceNetworkLineId } from '@tmlmobilidade/go-types-performance';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

type QueryValue = string | string[] | undefined;

export interface PerformanceNetworkHttpQuery {
	agency_id?: QueryValue
	agency_ids?: QueryValue
	end_date?: string
	start_date?: string
}

/* * */

export function parsePerformanceNetworkPeriod(query: PerformanceNetworkHttpQuery) {
	const period = parseDateRange(query);
	if (period.start_date === undefined || period.end_date === undefined) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'start_date and end_date are required');
	}

	return {
		end_date: validateOperationalDateInt(period.end_date),
		start_date: validateOperationalDateInt(period.start_date),
	};
}

export function parsePerformanceNetworkLinesQuery(query: PerformanceNetworkHttpQuery) {
	return {
		...parsePerformanceNetworkPeriod(query),
		agency_ids: parseIds(
			[query.agency_id, query.agency_ids],
			{ max_ids: 200, parameter_name: 'agency_ids' },
		),
	};
}

export function parsePerformanceNetworkLineIdentity(value: string) {
	try {
		return parsePerformanceNetworkLineId(value);
	} catch {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid network line ID');
	}
}
