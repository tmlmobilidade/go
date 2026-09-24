import { AMPLITUDE_BROWSER_OPTIONS, isAmplitudeEnabled } from '@/utils/analytics/config';
import { startAnalyticsHeartbeat } from '@/utils/analytics/heartbeat';
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

/* * */

describe('Amplitude active WebView heartbeat', () => {
	it('pings while visible and pauses while hidden', () => {
		let isVisible = true;
		let pingCount = 0;
		let visibilityChangeListener: (() => void) | undefined;
		const intervals = new Map<number, () => void>();
		let nextIntervalId = 1;

		const stopHeartbeat = startAnalyticsHeartbeat({
			addVisibilityChangeListener: listener => {
				visibilityChangeListener = listener;
			},
			clearInterval: intervalId => {
				intervals.delete(intervalId);
			},
			isVisible: () => isVisible,
			removeVisibilityChangeListener: listener => {
				if (visibilityChangeListener === listener) visibilityChangeListener = undefined;
			},
			setInterval: callback => {
				const intervalId = nextIntervalId;
				nextIntervalId += 1;
				intervals.set(intervalId, callback);
				return intervalId;
			},
		}, () => {
			pingCount += 1;
		});

		assert.equal(pingCount, 1);
		assert.equal(intervals.size, 1);

		intervals.get(1)?.();
		assert.equal(pingCount, 2);

		isVisible = false;
		visibilityChangeListener?.();
		assert.equal(intervals.size, 0);

		isVisible = true;
		visibilityChangeListener?.();
		assert.equal(pingCount, 3);
		assert.equal(intervals.size, 1);

		stopHeartbeat();
		assert.equal(intervals.size, 0);
		assert.equal(visibilityChangeListener, undefined);
	});

	it('waits for a hidden WebView to become visible', () => {
		let isVisible = false;
		let pingCount = 0;
		let visibilityChangeListener: (() => void) | undefined;

		const stopHeartbeat = startAnalyticsHeartbeat({
			addVisibilityChangeListener: listener => {
				visibilityChangeListener = listener;
			},
			clearInterval: () => undefined,
			isVisible: () => isVisible,
			removeVisibilityChangeListener: () => undefined,
			setInterval: () => 1,
		}, () => {
			pingCount += 1;
		});

		assert.equal(pingCount, 0);

		isVisible = true;
		visibilityChangeListener?.();
		assert.equal(pingCount, 1);

		stopHeartbeat();
	});
});
