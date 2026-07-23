const AMPLITUDE_PRODUCTION_ENVIRONMENT = 'prd';

/* * */

export function isAmplitudeEnabled(environment: string | undefined): boolean {
	return environment === AMPLITUDE_PRODUCTION_ENVIRONMENT;
}
