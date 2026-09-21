import { buildLogRecord } from '../../build-log-record.js';
import { emitLog } from '../../emit-log.js';
import { formatMessage } from '../../format-message.js';
import { type LoggerMessage, type ProgressArgs } from '../../types/message.js';

/**
 * Emits a structured OpenTelemetry debug record.
 */
export function debug(message: LoggerMessage): void {
	emitLog(buildLogRecord('debug', formatMessage(message)));
}

/**
 * Emits a structured OpenTelemetry progress record.
 */
export function progress(args: ProgressArgs): void {
	emitLog(buildLogRecord('info', formatMessage(args.message)));
}

/**
 * Emits a structured OpenTelemetry success record.
 */
export function success(message: LoggerMessage): void {
	emitLog(buildLogRecord('info', formatMessage(message)));
}

/**
 * Emits a structured OpenTelemetry warning record.
 */
export function warning(message: LoggerMessage): void {
	emitLog(buildLogRecord('warning', formatMessage(message)));
}
