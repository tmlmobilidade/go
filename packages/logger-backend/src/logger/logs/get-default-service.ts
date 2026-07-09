/**
 * Returns the default service name for logging/issue reporting.
 *
 * This tries the following sources, in order:
 *   1. process.env.SERVICE_NAME — Explicit environment variable override for service name.
 *   2. process.env.npm_package_name — The package name (from package.json, set by Node).
 *   3. 'unknown-service' — Fallback if neither is set.
 *
 * Used to annotate logs/issues with the running service identity.
 *
 * @returns {string} The identified service name or a fallback.
 */
export function getDefaultService(): string {
	return process.env.SERVICE_NAME ?? process.env.npm_package_name ?? 'unknown-service';
}
