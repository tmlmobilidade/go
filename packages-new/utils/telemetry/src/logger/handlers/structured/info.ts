import { buildLogRecord } from '../../build-log-record.js';
import { emitLog } from '../../emit-log.js';
import { extractAttributes } from '../../extract-attributes.js';
import { formatMessage } from '../../format-message.js';
import { getContext } from '../../parse-arguments.js';
import { type InfoArgs } from '../../types/message.js';

/**
 * Emits a structured OpenTelemetry informational record.
 */
export function info(args: InfoArgs): void {
	const context = getContext(args.contextOrSpacesAfter);
	emitLog(
		buildLogRecord(
			'info',
			formatMessage(args.message, context?.message ?? ''),
			extractAttributes(context),
		),
	);
}
