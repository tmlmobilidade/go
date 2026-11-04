import { type UserLocationError, type UserLocationErrorCode } from '@/types/common/user-location';

/* * */

interface DeviceOrientationReading {
	absolute: boolean
	alpha: null | number
	webkitCompassHeading?: null | number
}

interface GeolocationErrorReading {
	code: number
	message: string
}

/* * */

export function createUserLocationError(error: GeolocationErrorReading): UserLocationError {
	return {
		code: getUserLocationErrorCode(error.code),
		message: error.message,
	};
}

export function getDeviceOrientationBearing(reading: DeviceOrientationReading): null | number {
	if (Number.isFinite(reading.webkitCompassHeading)) {
		return normalizeBearing(reading.webkitCompassHeading);
	}

	if (!reading.absolute || !Number.isFinite(reading.alpha)) return null;
	return normalizeBearing(360 - reading.alpha);
}

/* * */

function getUserLocationErrorCode(code: number): UserLocationErrorCode {
	if (code === 1) return 'permission-denied';
	if (code === 2) return 'position-unavailable';
	if (code === 3) return 'timeout';
	return 'unknown';
}

function normalizeBearing(value: null | number | undefined): null | number {
	if (!Number.isFinite(value)) return null;
	return ((value % 360) + 360) % 360;
}
