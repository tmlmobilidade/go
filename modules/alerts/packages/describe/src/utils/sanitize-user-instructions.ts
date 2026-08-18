/* * */

import { userInstructionDelimitersPrompt } from '@/prompts/general/user-instructions.js';

/**
 * Sanitizes the user instructions by removing special characters and formatting the text.
 * @param userInstructions The user instructions to sanitize.
 * @returns The sanitized user instructions.
 */
export function sanitizeUserInstructions(userInstructions: string) {
	return userInstructions
		.normalize('NFKC') // Normalize the text to NFC
		.replaceAll('\n', ' ') // Replace newlines with spaces
		.replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
		.replace(/\s+/g, ' ') // Replace multiple spaces with a single space
		.replace(/!{2,}/g, m => m.split('').join('\\!')) // Replace multiple exclamation marks with a single exclamation mark
		.replace(/#{2,}/g, m => m.split('').join('\\#')) // Replace multiple hashes with a single hash
		.replace(/`{3,}/g, m => m.split('').join('\\`')) // Replace multiple backticks with a single backtick
		.replaceAll(userInstructionDelimitersPrompt.start, '') // Remove the start delimiter
		.replaceAll(userInstructionDelimitersPrompt.end, ''); // Remove the end delimiter
}
