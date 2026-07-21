/* * */

export interface RuntimeLogContext extends Record<string, unknown> {
	app: string
	module: string
}

/* * */

let CONFIGURED_RUNTIME_LOG_CONTEXT: RuntimeLogContext | undefined;

/* * */

export function getRuntimeLogContext(context?: Partial<RuntimeLogContext>): RuntimeLogContext {
	return {
		app: normalizeContextValue(context?.app) ?? normalizeContextValue(CONFIGURED_RUNTIME_LOG_CONTEXT?.app) ?? 'frontend',
		module: normalizeContextValue(context?.module) ?? normalizeContextValue(CONFIGURED_RUNTIME_LOG_CONTEXT?.module) ?? 'unknown-module',
	};
}

export function setRuntimeLogContext(context: RuntimeLogContext): RuntimeLogContext {
	const runtimeContext = getRuntimeLogContext(context);
	CONFIGURED_RUNTIME_LOG_CONTEXT = runtimeContext;
	return runtimeContext;
}

function normalizeContextValue(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const trimmedValue = value.trim();
	if (!trimmedValue) return undefined;
	return trimmedValue;
}
