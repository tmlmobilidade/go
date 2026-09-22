import { type LogLevel } from '../levels.js';
import { spacer } from '../presentation/spacer.js';
import { type LogRenderer } from '../types/logger.js';

/**
 * Glyph and console method per level. `satisfies` makes a missing level a compile error.
 * The method is stored by name and resolved on each call so patched consoles are honoured.
 */
const STYLE = {
	critical: { glyph: '‼', method: 'error' },
	debug: { glyph: '·', method: 'debug' },
	error: { glyph: '✘', method: 'error' },
	info: { glyph: '→', method: 'log' },
	progress: { glyph: '•', method: 'log' },
	success: { glyph: '✓', method: 'log' },
	warning: { glyph: '⚠', method: 'warn' },
} satisfies Record<LogLevel, { glyph: string, method: 'debug' | 'error' | 'log' | 'warn' }>;

/**
 * Human-readable console line for local development.
 *
 * Prints optional spacing, `glyph message`, and the error stack when an error is attached.
 * Attributes are not rendered.
 */
export const renderDev: LogRenderer = (record) => {
	const { glyph, method } = STYLE[record.level];
	if (record.spacesBefore) spacer(record.spacesBefore);
	console[method](`${glyph} ${record.message}`);
	if (record.error?.stack) console[method](record.error.stack);
	if (record.spacesAfter) spacer(record.spacesAfter);
};
