/**
 * Allowed app Environment values.
 * This type is used to define the environments in which the application can run.
 * It has a companion function `getCurrentEnvironment` that retrieves the current
 * environment based on the set environment variable.
 * - `production` is reserved for live production environments.
 * - `staging` is used for pre-production testing environments.
 * - `development` is used for local development environments. It uses staging variables.
 */
export type Environment = 'development' | 'k8s' | 'production' | 'staging';

/**
 * Get the current environment from server-side `ENVIRONMENT`
 * or client-side `NEXT_PUBLIC_ENVIRONMENT` variables.
 * @returns The current environment value.
 */
export function getCurrentEnvironment(): Environment {
	// Prefer server-side environment variable
	if (process.env.ENVIRONMENT) return process.env.ENVIRONMENT as Environment;
	// Fallback to client-side environment variable
	if (process.env.NEXT_PUBLIC_ENVIRONMENT) return process.env.NEXT_PUBLIC_ENVIRONMENT as Environment;
	// Fallback to development
	return 'development' as Environment;
}
