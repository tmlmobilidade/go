/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';

/* * */

export interface ApiResponse<T> {
	data: T
	error: null | string
	statusCode: typeof HTTP_STATUS[keyof typeof HTTP_STATUS]
}

/* * */

export function createApiResponse<T>(data: T, error: null | string, statusCode: typeof HTTP_STATUS[keyof typeof HTTP_STATUS]) {
	return {
		data,
		error,
		statusCode,
	};
}
