/* * */

import { type FastifyReply } from '@/types.js';
import { type ApiResponseError } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { createValidationErrorMap, formatValidationError } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

import { type ApiResponseOptions, getCacheControlHeader } from './response-options.js';

/**
 * Options for sending an error API response.
 */
interface SendErrorResponseOptions extends ApiResponseOptions {

	/**
	 * A public error message or a Zod validation error with structured field issues.
	 */
	error: ApiResponseError['error'] | z.ZodError

	locale?: string

	/**
	 * The status code to send in the error response.
	 */
	status_code: ApiResponseError['status_code']
}

/**
 * A function that sends an error HTTP response.
 */
export function sendErrorApiResponse<T>(reply: FastifyReply<T>, options: SendErrorResponseOptions) {
	//

	//
	// Set the status code

	if (!options.status_code) throw new Error('Status code is required in sendErrorApiResponse()');
	if (!options.error) throw new Error('Error message is required in sendErrorApiResponse()');

	reply.status(Number(options.status_code));

	//
	// Set the Cache-Control header

	const cacheControlHeader = getCacheControlHeader(options?.max_age);
	if (cacheControlHeader) reply.header('Cache-Control', cacheControlHeader);

	//
	// Set a timestamp for the response in UTC milliseconds

	const nowUnixMilliseconds = Dates.now('utc').unix_milliseconds;
	reply.header('Go-Upstream-Timestamp', nowUnixMilliseconds.toString());

	//
	// Return with the prepared response

	// Validation details are only returned for explicit client errors. A server-side
	// schema failure must not expose stored data or internal schema information.
	const validation = options.error instanceof z.ZodError && ['400', '422'].includes(options.status_code) ? options.error : undefined;
	const acceptedLanguage = reply.request.headers['accept-language']?.split(',')[0]?.split(';')[0]?.trim();
	const locale = options.locale ?? acceptedLanguage ?? 'pt';
	const map = createValidationErrorMap(locale);
	const issues = validation?.issues.map(issue => ({
		code: issue.code,
		message: map.translate(issue),
		path: issue.path.map(part => typeof part === 'number' ? part : String(part)),
	}));
	const response: ApiResponseError = {
		data: null,
		error: validation ? formatValidationError(validation, locale) : typeof options.error === 'string' ? options.error : 'Internal server error',
		...(issues ? { issues } : {}),
		status_code: options.status_code,
		timestamp: nowUnixMilliseconds,
	};

	return reply.send(response);
}
