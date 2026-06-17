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
				throw new HttpException(HTTP_STATUS.BAD_GATEWAY, `External API returned ${response.status}: ${response.statusText}`);
			}

			const data = await response.json() as CalendarEntry[];

			reply.send({
				data,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error({ error, message: 'Error fetching calendar data' });

			if (error instanceof HttpException) {
				throw error;
			}

			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve calendar data');
		}
	}
}
