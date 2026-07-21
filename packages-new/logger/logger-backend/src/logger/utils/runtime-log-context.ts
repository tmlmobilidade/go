/* * */

export interface RuntimeLogContext extends Record<string, unknown> {
	app: string
	module: string
}

/* * */

export function getRuntimeLogContext(context?: Partial<RuntimeLogContext>): RuntimeLogContext {
	return {
		app: normalizeContextValue(context?.app) ?? normalizeContextValue(process.env.APP) ?? 'unknown-app',
		module: normalizeContextValue(context?.module) ?? normalizeContextValue(process.env.MODULE) ?? 'unknown-module',
	};
}

function normalizeContextValue(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const trimmedValue = value.trim();
	if (!trimmedValue) return undefined;
	return trimmedValue;
}
