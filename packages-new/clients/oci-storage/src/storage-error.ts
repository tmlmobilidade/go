/* * */

export abstract class StorageError extends Error {
	abstract readonly code: string;
	abstract readonly retryable: boolean;

	override readonly cause?: unknown;

	readonly context: Record<string, unknown>;

	constructor(message: string, options?: { cause?: unknown, context?: Record<string, unknown> }) {
		super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
		this.name = new.target.name;
		this.context = options?.context ?? {};
		this.cause = options?.cause;
	}
}

export class NotFoundError extends StorageError {
	readonly code = 'STORAGE_NOT_FOUND';
	readonly retryable = false;
}

export class ValidationError extends StorageError {
	readonly code = 'STORAGE_VALIDATION';
	readonly retryable = false;
}

export class ConflictError extends StorageError {
	readonly code = 'STORAGE_CONFLICT';
	readonly retryable = false;
}

export class BlobStoreError extends StorageError {
	readonly code = 'STORAGE_BLOB';
	readonly retryable: boolean;

	constructor(message: string, options?: { cause?: unknown, context?: Record<string, unknown>, retryable?: boolean }) {
		super(message, options);
		this.retryable = options?.retryable ?? true;
	}
}

export class MetadataError extends StorageError {
	readonly code = 'STORAGE_METADATA';
	readonly retryable: boolean;

	constructor(message: string, options?: { cause?: unknown, context?: Record<string, unknown>, retryable?: boolean }) {
		super(message, options);
		this.retryable = options?.retryable ?? false;
	}
}

export class CompensationError extends StorageError {
	readonly code = 'STORAGE_COMPENSATION';
	readonly retryable = false;
	readonly suppressed: unknown[];

	constructor(message: string, options: { cause?: unknown, context?: Record<string, unknown>, suppressed: unknown[] }) {
		super(message, options);
		this.suppressed = options.suppressed;
	}
}

export class TimeoutError extends StorageError {
	readonly code = 'STORAGE_TIMEOUT';
	readonly retryable = true;
}

export function toStorageError(error: unknown, context?: Record<string, unknown>): StorageError {
	if (error instanceof StorageError) {
		if (context && Object.keys(context).length > 0) {
			return Object.assign(error, { context: { ...error.context, ...context } });
		}
		return error;
	}

	const message = error instanceof Error ? error.message : String(error);
	return new BlobStoreError(message, { cause: error, context, retryable: true });
}
