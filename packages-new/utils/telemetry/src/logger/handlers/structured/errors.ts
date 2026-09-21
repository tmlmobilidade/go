import { buildLogRecord } from '../../build-log-record.js';
import { emitLog } from '../../emit-log.js';
import { extractAttributes } from '../../extract-attributes.js';
import { formatMessage } from '../../format-message.js';
import { getError, getErrorContext } from '../../parse-arguments.js';
import { type ErrorArgs } from '../../types/message.js';

/**
 * Emits a structured OpenTelemetry error record.
 */
export function error(args: ErrorArgs): void {
	writeError('error', args);
}

/**
 * Emits a structured OpenTelemetry fatal record.
 */
export function fatal(args: ErrorArgs): void {
	writeError('critical', args);
}

function writeError(level: 'critical' | 'error', args: ErrorArgs): void {
	const context = getErrorContext(args.contextOrErrorOrSpacesAfter);
	if (context?.silentConsole) return;

	const parsedError = getError(args);
	emitLog(
		buildLogRecord(
			level,
			formatMessage(args.message, context?.message ?? parsedError?.message ?? ''),
			extractAttributes(context),
			parsedError,
		),
		true,
	);
}
