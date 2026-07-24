export interface OperationContext {
	[key: string]: unknown
	attachmentId?: string
	key?: string
	operation: string
	resourceId?: string
	scope?: string
}
