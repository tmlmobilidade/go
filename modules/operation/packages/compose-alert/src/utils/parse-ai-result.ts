/* * */

export interface ParseAiResultReturnType {
	description: string
	title: string
}

/**
 * Parses a model response expected to be a JSON object with title and description fields.
 */
export function parseAiResult(raw: string): ParseAiResultReturnType {
	//

	//
	// Extract the JSON object from the response

	const jsonMatch = raw.trim().match(/\{[\s\S]*\}/);

	if (!jsonMatch) throw new Error('AI response did not contain a JSON object with title and description');

	//
	// Parse the JSON object

	const parsed = JSON.parse(jsonMatch[0]) as { description?: unknown, title?: unknown };

	if (typeof parsed.title !== 'string' || typeof parsed.description !== 'string') {
		throw new Error('AI response JSON must include string "title" and "description" fields');
	}

	//
	// Validate the JSON object

	const title = parsed.title.trim();
	const description = parsed.description.trim();

	if (!title || !description) {
		throw new Error('AI response title and description must be non-empty');
	}

	//
	// Return the title and description

	return { description, title };
}
