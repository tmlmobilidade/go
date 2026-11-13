/* * */

/**
 * Returns the value of a required environment variable.
 */
export function getRequiredEnv(name: string): string {
	//

	//
	// A. Get the value of the environment variable

	const value = process.env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	//
	// B. Return the value of the environment variable

	return value;
}
