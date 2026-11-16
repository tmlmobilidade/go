import { type ApiResponse, ApiResponseErrorSchema, ApiResponseSchema, HttpStatusSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/** Preserve API errors on non-2xx JSON and multipart requests. */
export async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
	// Read the body before handling status: non-2xx bodies carry useful errors.
	const body: unknown = await response.json().catch(() => undefined);
	const apiError = ApiResponseErrorSchema.safeParse(body);
	if (apiError.success) return apiError.data;
	// JSON omits undefined data in successful responses for actions such as deletes.
	const normalizedBody = body && typeof body === 'object' ? { data: undefined, ...body } : body;
	const parsed = ApiResponseSchema.safeParse(normalizedBody);
	if (response.ok && parsed.success) return parsed.data as ApiResponse<T>;
	const status = HttpStatusSchema.safeParse(String(response.status));
	const fallback = ApiResponseErrorSchema.safeParse({
		data: null,
		error: response.ok ? 'Invalid response from server' : `HTTP ${response.status} - ${response.statusText}`,
		status_code: status.success ? status.data : '500',
		timestamp: Dates.now('utc').unix_milliseconds,
	});
	if (fallback.success) return fallback.data;
	throw new Error(`HTTP ${response.status} - ${response.statusText}`);
}
