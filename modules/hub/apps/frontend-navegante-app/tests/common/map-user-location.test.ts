import { createUserLocationError, getDeviceOrientationBearing } from '@/utils/map/user-location';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('user location sensor helpers', () => {
	it('prefers the Safari compass heading', () => {
		assert.equal(getDeviceOrientationBearing({
			absolute: false,
			alpha: 45,
			webkitCompassHeading: 270,
		}), 270);
	});

	it('converts absolute alpha rotation into a compass bearing', () => {
		assert.equal(getDeviceOrientationBearing({
			absolute: true,
			alpha: 45,
		}), 315);
	});

	it('ignores relative or incomplete orientation readings', () => {
		assert.equal(getDeviceOrientationBearing({ absolute: false, alpha: 45 }), null);
		assert.equal(getDeviceOrientationBearing({ absolute: true, alpha: null }), null);
	});

	it('normalizes compass headings to one full rotation', () => {
		assert.equal(getDeviceOrientationBearing({
			absolute: false,
			alpha: null,
			webkitCompassHeading: 450,
		}), 90);
	});

	it('maps browser geolocation error codes to stable app codes', () => {
		assert.deepEqual(createUserLocationError({ code: 1, message: 'denied' }), {
			code: 'permission-denied',
			message: 'denied',
		});
		assert.deepEqual(createUserLocationError({ code: 2, message: 'unavailable' }), {
			code: 'position-unavailable',
			message: 'unavailable',
		});
		assert.deepEqual(createUserLocationError({ code: 3, message: 'timed out' }), {
			code: 'timeout',
			message: 'timed out',
		});
		assert.deepEqual(createUserLocationError({ code: 99, message: 'other' }), {
			code: 'unknown',
			message: 'other',
		});
	});
});
