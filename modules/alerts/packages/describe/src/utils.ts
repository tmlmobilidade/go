/* * */

type PromptPart = 'body' | 'intro';

/**
 * Utility class to build the prompt string for the alert description templates.
 * This class provides methods to append text to the prompt, add new lines,
 * and retrieve the final prompt string. It is used to construct the prompt
 * in a structured way, allowing for better readability and maintainability
 * of the code that generates the alert descriptions.
 */
export class PromptBuilder {
	//

	private body: string;
	private intro: string;

	constructor() {
		this.intro = '';
		this.body = '';
	}

	append(to: PromptPart, text: string) {
		this[to] = `${this[to]} ${text}`;
	}

	/**
	 * Retrieves the final prompt string.
	 * @returns The prompt string until now.
	 */
	get() {
		return `
			${this.intro}\n
			${this.body}
		`.trim();
	}

	/**
	 * Adds a new line to the prompt, by appending the given text to the specified part of the prompt.
	 * @param to The part of the prompt to which the new line should be added. Can be either 'intro' or 'body'.
	 * @param text The text to be added as a new line to the prompt.
	 */
	add(to: PromptPart, text: string) {
		this.append(to, '\n' + text);
	}

	/**
	 * Resets the specified part of the prompt to an empty string,
	 * effectively clearing any text that was previously added to that part.
	 * @param to The part of the prompt to reset. Can be either 'intro' or 'body'.
	 */
	reset(to: PromptPart) {
		this[to] = '';
	}

	/**
	 * Compresses the prompt by removing extra spaces and new lines,
	 * and concatenating the intro and body parts.
	 * @returns The compressed prompt string.
	 */
	compress() {
		return `${this.intro} ${this.body}`
			.replaceAll('  ', ' ')
			.replaceAll('\n', '')
			.trim();
	}

	//
}
