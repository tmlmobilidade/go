/* * */

import { type FastifyLoggerOptions, type RawServerDefault } from 'fastify';

import { createDevLoggerOptions } from './create-dev-logger-options.js';
import { IS_DEV } from './is-dev.js';

export { IS_DEV } from './is-dev.js';

/**
 * Fastify logger config: pretty one-line in `dev`, disabled otherwise
 * (request logs go through `@tmlmobilidade/go-utils-telemetry` Logger).
 */
export function createFastifyLoggerOptions(getModuleName: () => string): false | (FastifyLoggerOptions<RawServerDefault> & { module?: string }) {
	if (IS_DEV) return createDevLoggerOptions(getModuleName);
	return false;
}
