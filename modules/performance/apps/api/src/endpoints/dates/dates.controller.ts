/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/* * */

interface CalendarEntry {
	date: string
	day_type: string
	holiday: string
	notes: string
	period: string
}

export class DatesController {
	/**
	 * Get calendar data
	 */
	static async getCalendar(
		request: FastifyRequest,
		reply: FastifyReply<unknown>,
	) {
		try {
			const response = await fetch('https://go.carrismetropolitana.pt/api/dates/public');

			if (!response.ok) {
				const error = new HttpException(HTTP_STATUS.BAD_GATEWAY, `External API returned ${response.status}: ${response.statusText}`);
				Logger.issue('error', error, {
					action: 'getCalendar',
					feature: 'dates',
					request,
				});
				throw error;
			}

			const data = await response.json() as CalendarEntry[];

			reply.send({
				data,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error('Error fetching calendar data:', error);

			if (error instanceof HttpException) {
				Logger.issue('error', error, {
					action: 'getCalendar',
					feature: 'dates',
					request,
				});
				throw error;
			}

			const err = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve calendar data');
			Logger.issue('error', err, {
				action: 'getCalendar',
				feature: 'dates',
				request,
			});
			throw err;
		}
	}
}
