import { type ApiResponseError, type ApiValidationIssue } from '@tmlmobilidade/go-types-shared';

/** Preserves API status and validation details for action callbacks and form fields. */
export class ApiError extends Error {
	readonly issues: ApiValidationIssue[];
	readonly response?: ApiResponseError;
	readonly statusCode: ApiResponseError['status_code'];

	constructor(message: string, response?: ApiResponseError) {
		super(message);
		this.name = 'ApiError';
		this.response = response;
		this.issues = response?.issues ?? [];
		this.statusCode = response?.status_code ?? '500';
	}

	get fieldErrors(): Record<string, string> {
		return Object.fromEntries(this.issues.filter(issue => issue.path.length).map(issue => [issue.path.join('.'), issue.message]));
	}
}
