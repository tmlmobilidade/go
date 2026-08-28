/* * */

import { type FastifyReply } from '@/fastify-service.js';
import { Dates } from '@tmlmobilidade/go-utils-dates';
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
 * @example
 * ```ts
 * sendSuccessApiResponse(reply, { message: 'Hello, world!' });
 * ```
 * @example
 * ```ts
 * // With a different status code (e.g. 201 Created)
 * sendSuccessApiResponse<Item[]>(reply, queryResult, { status_code: '201' });
 * ```
 * @example
 * ```ts
 * // With a cache control header (e.g. 1 minute)
 * sendSuccessApiResponse<PublicResource>(reply, queryResult, { max_age: 60 });
 * ```
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
		timestamp: Dates.now('local').unix_milliseconds,
	};

	return reply.send(response);
}
