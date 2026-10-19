/* * */

import { createLogger } from './create-logger.js';
import { renderDev } from './render/dev.js';
import { renderStructured } from './render/structured.js';
import { type Logger as LoggerApi } from './types/logger.js';

/* * */

const IS_DEV = process.env.ENVIRONMENT === 'dev';

/* * */

/**
 * Shared application logger.
 * Human-readable console output in development, OpenTelemetry JSON lines otherwise.
 */
export const Logger: LoggerApi = createLogger(IS_DEV ? renderDev : renderStructured);

export type { LogLevel } from './levels.js';
export type { OtelLogRecord } from './render/structured.js';
export type { LogEntry, LogInput, LogRecord } from './types/entry.js';
export type { Logger as LoggerApi, LogRenderer } from './types/logger.js';
