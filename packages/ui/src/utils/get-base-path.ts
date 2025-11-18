/**
 * Get the base path of the application
 * as defined in next.config.js.
 * @returns The base path.
 */
export function getBasePath() {
	return process.env.NEXT_PUBLIC_BASE_PATH || 'base-path-not-set';
};
