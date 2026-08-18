/* * */

import { type PromptContext, type PromptContextBlock } from './types.js';

/* * */

const emptyPromptContextBlocks: Record<PromptContextBlock, string[]> = {
	body: [],
	footer: [],
	init: [],
};

/**
 * Initializes the prompt context.
 * @returns The prompt context.
 */
export function initPromptContext(): PromptContext {
	return {
		en: emptyPromptContextBlocks,
		pt: emptyPromptContextBlocks,
	};
}
