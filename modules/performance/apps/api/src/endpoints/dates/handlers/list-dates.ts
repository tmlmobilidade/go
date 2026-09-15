/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';

/* * */

const CALENDAR_PUBLIC_URL = 'https://go.carrismetropolitana.pt/api/dates/public';

/* * */

export interface CalendarEntry {
	date: string
	day_type: string
	holiday: string
	notes: string
	period: string
}

/**
 * Returns the public calendar entries (day types, holidays and periods).
 * @param request The request object
 * @param reply The reply object
 */
export async function listDatesHandler(request: FastifyRequest, reply: FastifyReply<CalendarEntry[]>) {
	//

	//
	// Fetch the calendar from the public API

	const response = await fetch(CALENDAR_PUBLIC_URL);

	if (!response.ok) {
		return sendErrorApiResponse(reply, {
			error: `External API returned ${response.status}: ${response.statusText}`,
			status_code: '500',
		});
	}

	const calendarEntries = await response.json() as CalendarEntry[];

	return sendSuccessApiResponse(reply, calendarEntries);
}
