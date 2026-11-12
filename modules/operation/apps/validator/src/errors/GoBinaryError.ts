/**
 * Error thrown when a Go binary execution fails.
 */
export class GoBinaryError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly exitCode?: number,
		public readonly stdout?: string,
		public readonly stderr?: string,
	) {
		super(message);
		this.name = 'GoBinaryError';
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, GoBinaryError);
		}
	}
}
