/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';

/* * */

export function isUnauthorizedError(error: unknown): error is HttpException {
	return error instanceof HttpException && error.statusCode === HTTP_STATUS.UNAUTHORIZED;
}
