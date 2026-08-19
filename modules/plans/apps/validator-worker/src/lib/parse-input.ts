/**
 * Parses the input into a record.
 * @param input - The input to parse.
 * @returns The parsed input.
 */
export function parseInput(input: unknown): unknown {
	//

	// Mongo may contain either the structured object or its legacy JSON string.
	if (typeof input !== 'string') return input;

	try {
		return JSON.parse(input) as unknown;
	} catch {
		return null;
	}
}
