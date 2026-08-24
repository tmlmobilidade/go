import * as Sentry from '@sentry/nextjs';

/* * */

type ConsoleMethod = 'assert' | 'debug' | 'error' | 'info' | 'log' | 'trace' | 'warn';
type SentryLogLevel = 'debug' | 'error' | 'info' | 'trace' | 'warn';

interface PendingConsoleLog {
	args: unknown[]
	level: SentryLogLevel
}

/* * */

const CONSOLE_METHODS: readonly ConsoleMethod[] = ['assert', 'debug', 'error', 'info', 'log', 'trace', 'warn'];
const MAX_PENDING_LOGS = 1000;

let CONSOLE_LOG_BRIDGE_INSTALLED = false;
let CONSOLE_LOG_BRIDGE_READY = false;
let PENDING_CONSOLE_LOGS: PendingConsoleLog[] = [];

/* * */

/**
 * Installs a browser console bridge before the asynchronous Sentry client
 * configuration is resolved. Console output is still sent to the browser and
 * is queued for Sentry until the client is ready.
 */
export function installConsoleLogBridge(): void {
	if (CONSOLE_LOG_BRIDGE_INSTALLED) return;

	const consoleRef = Reflect.get(globalThis, 'console') as unknown as Record<string, unknown> | undefined;
	if (!consoleRef) return;

	for (const method of CONSOLE_METHODS) {
		const originalMethod = consoleRef[method];
		if (typeof originalMethod !== 'function') continue;

		consoleRef[method] = (...args: unknown[]) => {
			Reflect.apply(originalMethod, consoleRef, args);
			try {
				captureConsoleLog(method, args);
			} catch {
				// Logging must never change the behavior of the application.
			}
		};
	}

	CONSOLE_LOG_BRIDGE_INSTALLED = true;
}

/**
 * Marks the bridge as ready and forwards logs captured while Sentry was
 * initializing.
 */
export function enableConsoleLogBridge(): void {
	CONSOLE_LOG_BRIDGE_READY = true;

	const logsToSend = PENDING_CONSOLE_LOGS;
	PENDING_CONSOLE_LOGS = [];

	for (const log of logsToSend) sendConsoleLog(log);
}

/**
 * Discards queued logs when Sentry cannot be initialized. The original
 * browser console remains available, but logs are not retained indefinitely.
 */
export function discardConsoleLogBridge(): void {
	CONSOLE_LOG_BRIDGE_READY = false;
	PENDING_CONSOLE_LOGS = [];
}

/* * */

function captureConsoleLog(method: ConsoleMethod, args: unknown[]): void {
	if (method === 'assert' && args[0]) return;

	const log: PendingConsoleLog = {
		args: method === 'assert' ? args.slice(1) : args,
		level: getSentryLogLevel(method),
	};

	if (!CONSOLE_LOG_BRIDGE_READY) {
		if (PENDING_CONSOLE_LOGS.length >= MAX_PENDING_LOGS) PENDING_CONSOLE_LOGS.shift();
		PENDING_CONSOLE_LOGS.push(log);
		return;
	}

	sendConsoleLog(log);
}

function sendConsoleLog(log: PendingConsoleLog): void {
	const message = formatConsoleArguments(log.args, log.level === 'error' && log.args.length === 0);
	if (!message) return;

	const attributes = getConsoleAttributes(log.args);

	if (log.level === 'debug') {
		Sentry.logger.debug(message, attributes);
		return;
	}

	if (log.level === 'error') {
		Sentry.logger.error(message, attributes);
		return;
	}

	if (log.level === 'trace') {
		Sentry.logger.trace(message, attributes);
		return;
	}

	if (log.level === 'warn') {
		Sentry.logger.warn(message, attributes);
		return;
	}

	Sentry.logger.info(message, attributes);
}

function getSentryLogLevel(method: ConsoleMethod): SentryLogLevel {
	if (method === 'assert') return 'error';
	if (method === 'log') return 'info';
	return method;
}

function formatConsoleArguments(args: unknown[], isEmptyError: boolean): string {
	if (args.length === 0) return isEmptyError ? 'Error logged without a message.' : '';

	return args.map(formatConsoleArgument).join(' ');
}

function formatConsoleArgument(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value instanceof Error) return value.stack || value.message;
	if (value === null) return 'null';
	if (typeof value === 'undefined') return 'undefined';
	if (typeof value === 'bigint' || typeof value === 'symbol') return String(value);

	try {
		const serializedValue = JSON.stringify(value);
		return serializedValue === undefined ? String(value) : serializedValue;
	} catch {
		return '[unserializable console argument]';
	}
}

function getConsoleAttributes(args: unknown[]): Record<string, unknown> {
	const [firstArgument, ...remainingArguments] = args;
	const attributes: Record<string, unknown> = {};

	if (isObject(firstArgument) && !Array.isArray(firstArgument)) Object.assign(attributes, firstArgument);
	if (firstArgument instanceof Error) {
		attributes.error_name = firstArgument.name;
		attributes.error_message = firstArgument.message;
		if (firstArgument.stack) attributes.error_stack = firstArgument.stack;
	}

	remainingArguments.forEach((argument, index) => {
		attributes[`sentry.message.parameter.${index}`] = argument;
	});

	return attributes;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}
