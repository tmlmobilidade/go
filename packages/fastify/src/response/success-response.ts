/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type ApiResponseSuccess, ApiResponseSuccessSchema } from '@tmlmobilidade/go-types-shared';
import { type FastifyReply } from 'fastify';

import { type ApiResponseOptions, getCacheControlHeader } from './response-options.js';

/**
 * Options for sending a successful API response.
 */
interface SendSuccessApiResponseOptions<T> extends ApiResponseOptions {

	/**
	 * The status code to send in the successful response.
	 * Defaults to `200`.
	 */
	statusCode?: ApiResponseSuccess<T>['status_code']
}

/**
 * A function that sends a successful HTTP response.
 */
export function sendSuccessApiResponse<T>(reply: FastifyReply, data: T, options?: SendSuccessApiResponseOptions<T>) {
	//

	//
	// Set the status code

	const statusCodeValue = options?.statusCode || '200';
	reply.status(Number(statusCodeValue));

	//
	// Set the Cache-Control header

	const cacheControlHeader = getCacheControlHeader(options?.max_age);
	if (cacheControlHeader) reply.header('Cache-Control', cacheControlHeader);

	//
	// Return with the prepared response

	const response = ApiResponseSuccessSchema.parse({
		data,
		error: null,
		status_code: statusCodeValue,
		timestamp: Dates.now('local').unix_timestamp,
	});

	return reply.send(response);
}
