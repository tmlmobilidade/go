/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type ApiResponseError, ApiResponseErrorSchema } from '@tmlmobilidade/go-types-shared';
import { type FastifyReply } from 'fastify';

import { type ApiResponseOptions, getCacheControlHeader } from './response-options.js';

/**
 * Options for sending an error API response.
 */
interface SendErrorResponseOptions extends ApiResponseOptions {

	/**
	 * The error message to send in the error response.
	 */
	error: ApiResponseError['error']

	/**
	 * The status code to send in the error response.
	 */
	statusCode: ApiResponseError['status_code']
}

/**
 * A function that sends an error HTTP response.
 */
export function sendErrorApiResponse(reply: FastifyReply, options: SendErrorResponseOptions) {
	//

	//
	// Set the status code

	if (!options.statusCode) throw new Error('Status code is required in sendErrorApiResponse()');
	if (!options.error) throw new Error('Error message is required in sendErrorApiResponse()');

	reply.status(Number(options.statusCode));

	//
	// Set the Cache-Control header

	const cacheControlHeader = getCacheControlHeader(options?.max_age);
	if (cacheControlHeader) reply.header('Cache-Control', cacheControlHeader);

	//
	// Return with the prepared response

	const response = ApiResponseErrorSchema.parse({
		data: null,
		error: options.error,
		status_code: options.statusCode,
		timestamp: Dates.now('local').unix_timestamp,
	});

	return reply.send(response);
}
