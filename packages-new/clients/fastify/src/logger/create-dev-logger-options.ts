/* * */

import oneLineLogger from '@fastify/one-line-logger';
import { type FastifyLoggerOptions, type RawServerDefault } from 'fastify';

import { formatDevMessage } from './format-dev-message.js';

/**
 * Pretty one-line Pino logger options for local development.
 */
export function createDevLoggerOptions(getModuleName: () => string): FastifyLoggerOptions<RawServerDefault> & { module?: string } {
	return {
		level: 'debug',
		module: getModuleName(),
		stream: oneLineLogger({
			colorize: true,
			colorizeObjects: true,
			messageFormat(log, messageKey, _, extras) {
				return formatDevMessage(log as Record<string, unknown>, messageKey, extras.colors);
			},
		}),
	};
}
