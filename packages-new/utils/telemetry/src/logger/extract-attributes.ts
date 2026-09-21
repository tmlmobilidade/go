const RESERVED_ATTRIBUTE_KEYS = new Set(['message', 'silentConsole']);

/**
 * Removes logger control fields and undefined values from a logging context.
 */
export function extractAttributes(context?: Record<string, unknown>): Record<string, unknown> | undefined {
	if (!context) return undefined;

	const attributes = Object.fromEntries(
		Object.entries(context).filter(([key, value]) => !RESERVED_ATTRIBUTE_KEYS.has(key) && value !== undefined),
	);

	return Object.keys(attributes).length ? attributes : undefined;
}
