import { type LogLevel } from './levels.js';
import { divider } from './presentation/divider.js';
import { init } from './presentation/init.js';
import { spacer } from './presentation/spacer.js';
import { terminate } from './presentation/terminate.js';
import { title } from './presentation/title.js';
import { toRecord } from './to-record.js';
import { type LogInput } from './types/entry.js';
import { type Logger, type LogRenderer } from './types/logger.js';

/**
 * Builds the public logger around one renderer.
 *
 * Every level method goes through the same `log` path, so their signatures cannot drift.
 * Presentation helpers are plain console output and behave the same in every environment.
 */
export function createLogger(render: LogRenderer): Logger {
	const log = (level: LogLevel, input: LogInput): void => render(toRecord(level, input));
	return {
		critical: input => log('critical', input),
		debug: input => log('debug', input),
		divider,
		error: input => log('error', input),
		info: input => log('info', input),
		init,
		log,
		progress: input => log('progress', input),
		spacer,
		success: input => log('success', input),
		terminate,
		title,
		warning: input => log('warning', input),
	};
}
