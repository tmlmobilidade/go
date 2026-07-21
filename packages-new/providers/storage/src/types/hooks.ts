import { type StorageError } from '@tmlmobilidade/go-clients-oci-storage';

export interface OperationHooks<TContext, TResult> {
	onError?: (ctx: TContext, error: StorageError) => Promise<void> | void
	onFinally?: (ctx: TContext) => Promise<void> | void
	onRollback?: (ctx: TContext, error?: StorageError) => Promise<void> | void
	onStart?: (ctx: TContext) => Promise<void> | void
	onSuccess?: (ctx: TContext, result: TResult) => Promise<void> | void
}
