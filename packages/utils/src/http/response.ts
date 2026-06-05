/* * */

export class HttpResponse<T> {
	public readonly data: null | T;
	public readonly error: null | string;
	public readonly isOk?: () => boolean;
	public readonly statusCode: number;

	constructor(
		{ data, error, statusCode }: { data: null | T, error: null | string, statusCode: number },
	) {
		this.data = data;
		this.error = error;
		this.statusCode = statusCode;

		this.isOk = () => statusCode >= 200 && statusCode < 300;
	}
}
