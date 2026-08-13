/* * */

import { type FastifyReply } from '@/fastify-service.js';
import { Dates } from '@tmlmobilidade/dates';
import { type ApiResponseSuccess } from '@tmlmobilidade/go-types-shared';

import { type ApiResponseOptions, getCacheControlHeader } from './response-options.js';

/**
 * Options for sending a successful API response.
 */
interface SendSuccessApiResponseOptions<T> extends ApiResponseOptions {

	/**
	 * The status code to send in the successful response.
	 * Defaults to `200`.
	 */
	status_code?: ApiResponseSuccess<T>['status_code']
}

/**
 * A function that sends a successful HTTP response.
 */
export function sendSuccessApiResponse<T>(reply: FastifyReply<T>, data: T, options?: SendSuccessApiResponseOptions<T>) {
	//

	//
	// Set the status code

	const statusCodeValue = options?.status_code || '200';
	reply.status(Number(statusCodeValue));

	//
	// Set the Cache-Control header

	const cacheControlHeader = getCacheControlHeader(options?.max_age);
	if (cacheControlHeader) reply.header('Cache-Control', cacheControlHeader);

	//
	// Return with the prepared response

	const response: ApiResponseSuccess<T> = {
		data,
		error: null,
		status_code: statusCodeValue,
		timestamp: Dates.now('local').unix_timestamp,
	};

	return reply.send(response);
}
