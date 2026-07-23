import { AMPLITUDE_BROWSER_OPTIONS, isAmplitudeEnabled } from '@/utils/analytics/config';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('Amplitude environment configuration', () => {
	it('enables Amplitude only for production builds', () => {
		assert.equal(isAmplitudeEnabled('prd'), true);
		assert.equal(isAmplitudeEnabled('dev'), false);
		assert.equal(isAmplitudeEnabled('staging'), false);
		assert.equal(isAmplitudeEnabled('pr-123'), false);
		assert.equal(isAmplitudeEnabled(undefined), false);
	});

	it('collects only the properties needed for audience measurement', () => {
		assert.deepEqual(AMPLITUDE_BROWSER_OPTIONS, {
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
		});
	});
});
