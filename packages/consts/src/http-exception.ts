/* * */

import { HTTP_STATUS } from '@/http-status.js';

/* * */

export class HttpException extends Error {
	readonly statusCode: number;

	constructor(statusCode: number, message: string, cause?: unknown) {
		super(message);
		this.statusCode = statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
		this.message = message;
		this.cause = cause;
	}
}
