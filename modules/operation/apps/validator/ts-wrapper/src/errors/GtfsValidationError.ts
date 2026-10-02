export class GtfsValidationError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly originalError?: Error,
		public readonly stdout?: string,
		public readonly stderr?: string,
	) {
		super(message);
		this.name = 'GtfsValidationError';
	}
}
