/* * */

import { type PromptContext } from './types.js';

/**
 * Initializes the prompt context.
 * @returns The prompt context.
 */
export function initPromptContext(): PromptContext {
	return {
		data: [],
		intro: [],
		references: [],
		user_instructions: [],
	};
}
