import type * as amplitude from '@amplitude/analytics-browser';

/* * */

const AMPLITUDE_PRODUCTION_ENVIRONMENT = 'prd';

/* * */

export const AMPLITUDE_BROWSER_OPTIONS = {
	autocapture: false,
	enableDiagnostics: false,
	remoteConfig: {
		fetchRemoteConfig: false,
	},
	trackingOptions: {
		ipAddress: false,
		language: false,
		platform: false,
	},
} satisfies amplitude.Types.BrowserOptions;

/* * */

export function isAmplitudeEnabled(environment: string | undefined): boolean {
	return environment === AMPLITUDE_PRODUCTION_ENVIRONMENT;
}
