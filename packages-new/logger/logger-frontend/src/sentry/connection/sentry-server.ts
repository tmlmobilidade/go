/**
 * Sentry request log integration for Next.js server environments.
 *
 * This module captures Next.js development request lines from stdout and
 * completed Node.js responses in production, then enriches the Sentry log with
 * runtime context and request metadata.
 *
 * Usage:
 *   Call `registerSentryNextRequestLogs(context)` at server bootstrap to enable
 *   Sentry request log enrichment.
 */

import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import { getRuntimeLogContext, type RuntimeLogContext } from '@/logger/utils/runtime-log-context.js';
import { getGlobalScope, logger } from '@sentry/core';

/**
 * Mimics a Node.js-like stdout with an overridable 'write' method
 */
interface StdoutLike {
	write: (...args: unknown[]) => unknown
}

/**
 * Mimics the process object with optional stdout
 */
interface ProcessLike {
	env?: Record<string, string | undefined>
	getBuiltinModule?: (id: 'node:http') => HttpModule | undefined
	stdout?: StdoutLike
}

interface HttpModule {
	IncomingMessage: typeof import('node:http').IncomingMessage
	Server: typeof import('node:http').Server
	ServerResponse: typeof import('node:http').ServerResponse
}

/**
 * Context for an individual HTTP request log, merged with runtime context.
 */
interface RequestLogContext extends RuntimeLogContext {
	duration_ms?: number // Duration in milliseconds, if available
	method: string // HTTP method, e.g., GET
	path: string // Request path, e.g., /api/user
	status_code: number // HTTP status code, e.g., 200
}

const SERVER_REQUEST_LOGS_REGISTERED = Symbol.for('@tmlmobilidade/logger-frontend/server-request-logs-registered');

/**
 * Pattern for matching standardized HTTP request logs:
 *   "<METHOD> <PATH> <STATUS_CODE> [in <DURATION> <ms|s>]"
 */
const REQUEST_LOG_PATTERN = /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s+(\d{3})(?:\s+in\s+([0-9.]+)\s*(ms|s))?/;

/**
 * Pattern for matching ANSI escape (VT control) sequences in console output.
 */
const VT_CONTROL_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`, 'g');

/**
 * Installs the request-log hook appropriate for the current environment.
 *
 * This should only be called once per process.
 *
 * @param context - The base runtime log context (e.g., { app, module }) to be merged.
 */
export function registerSentryNextRequestLogs(context: RuntimeLogContext): void {
	const processRef = Reflect.get(globalThis, 'process') as ProcessLike | undefined;

	if (processRef?.env?.NODE_ENV === 'production') {
		registerProductionRequestLogs(context, processRef);
		return;
	}

	registerDevelopmentRequestLogs(context, processRef);
}

/**
 * Next.js prints completed request lines to stdout only in development. Keep
 * parsing those lines locally so the terminal output and its Sentry copy stay
 * identical.
 */
function registerDevelopmentRequestLogs(context: RuntimeLogContext, processRef: ProcessLike | undefined): void {
	const stdout = processRef?.stdout;

	// Abort if stdout isn't available
	if (!stdout || typeof stdout.write !== 'function') return;

	const originalWrite = stdout.write.bind(stdout);

	/**
	 * Patched write function: inspects outgoing data, forwards it,
	 * and triggers request log capture if it matches our pattern.
	 */
	stdout.write = (...args: unknown[]) => {
		captureRequestLog(args[0], context);
		return originalWrite(...args);
	};
}

/**
 * The production Next.js server does not print its development request lines.
 * Observe Node's completed responses instead so Preview emits the equivalent
 * method, path, status and duration log from real response data.
 */
function registerProductionRequestLogs(context: RuntimeLogContext, processRef: ProcessLike): void {
	const http = processRef.getBuiltinModule?.('node:http');
	if (!http) return;

	const incomingMessageConstructor = http.IncomingMessage;
	const serverConstructor = http.Server;
	const serverResponseConstructor = http.ServerResponse;
	const serverPrototype = serverConstructor.prototype as object;
	if (Reflect.get(serverPrototype, SERVER_REQUEST_LOGS_REGISTERED)) return;

	const originalEmit = Reflect.get(serverPrototype, 'emit') as (this: Server, eventName: string | symbol, ...args: unknown[]) => boolean;

	Reflect.set(serverPrototype, SERVER_REQUEST_LOGS_REGISTERED, true);
	Reflect.set(serverPrototype, 'emit', function (this: Server, eventName: string | symbol, ...args: unknown[]): boolean {
		if (eventName === 'request') {
			const [request, response] = args;
			if (request instanceof incomingMessageConstructor && response instanceof serverResponseConstructor) {
				captureCompletedRequest(request, response, context);
			}
		}

		return originalEmit.call(this, eventName, ...args);
	});
}

function captureCompletedRequest(request: IncomingMessage, response: ServerResponse, context: RuntimeLogContext): void {
	const startedAt = performance.now();

	response.once('finish', () => {
		const durationMs = Math.max(0, performance.now() - startedAt);
		const method = request.method ?? 'UNKNOWN';
		const path = request.url ?? '/';
		const statusCode = response.statusCode;
		const message = `${method} ${path} ${statusCode} in ${formatDuration(durationMs)}`;

		getGlobalScope().setAttributes(getRuntimeLogContext(context));
		logger.info(message, {
			...getRuntimeLogContext(context),
			duration_ms: durationMs,
			method,
			path,
			status_code: statusCode,
		});
	});
}

function formatDuration(durationMs: number): string {
	if (durationMs >= 1000) return `${(durationMs / 1000).toFixed(1)}s`;
	return `${Math.round(durationMs)}ms`;
}

/**
 * Attempts to normalize a log chunk into a string, strips ANSI/VT codes,
 * and extracts HTTP request info for forwarding to Sentry.
 *
 * @param chunk - Output chunk from stdout.write (string | Uint8Array)
 * @param context - Runtime log context to attach
 */
function captureRequestLog(chunk: unknown, context: RuntimeLogContext): void {
	const message = normalizeStdoutChunk(chunk);
	if (!message) return;

	const requestLogContext = parseRequestLog(message, context);
	if (!requestLogContext) return;

	getGlobalScope().setAttributes(getRuntimeLogContext(context));
	logger.info(message, requestLogContext);
}

/**
 * Ensures chunk is a string, removes terminal control characters,
 * and trims whitespace for easier matching/processing.
 *
 * @param chunk - Raw log data from stdout
 * @returns Cleaned log string or undefined if not convertible
 */
function normalizeStdoutChunk(chunk: unknown): string | undefined {
	if (typeof chunk === 'string') return stripControlCharacters(chunk).trim();

	if (chunk instanceof Uint8Array) {
		return stripControlCharacters(new TextDecoder().decode(chunk)).trim();
	}

	return undefined;
}

/**
 * Attempts to extract HTTP method, path, status, and duration from
 * a request log line, merging with runtime context.
 *
 * @param message - Single log line from stdout
 * @param context - Runtime context for enrichment
 * @returns RequestLogContext object or undefined if not a request log
 */
function parseRequestLog(message: string, context: RuntimeLogContext): RequestLogContext | undefined {
	const match = REQUEST_LOG_PATTERN.exec(message);
	if (!match) return undefined;

	const [, method, path, statusCode, duration, durationUnit] = match;
	const durationMs = duration ? Number.parseFloat(duration) * (durationUnit === 's' ? 1000 : 1) : undefined;

	return {
		...getRuntimeLogContext(context),
		...(durationMs !== undefined && { duration_ms: durationMs }),
		method,
		path,
		status_code: Number.parseInt(statusCode, 10),
	};
}

/**
 * Removes ANSI terminal control codes from a string.
 *
 * @param value - Original string potentially containing escape sequences
 * @returns String without VT/ANSI codes
 */
function stripControlCharacters(value: string): string {
	return value.replace(VT_CONTROL_PATTERN, '');
}
