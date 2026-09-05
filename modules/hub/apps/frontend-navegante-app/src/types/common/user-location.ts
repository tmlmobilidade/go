export type UserLocationErrorCode = 'permission-denied' | 'position-unavailable' | 'timeout' | 'unknown' | 'unsupported';

export interface UserLocationError {
	code: UserLocationErrorCode
	message: string
}

export interface UserLocation {
	accuracy: null | number
	bearing: null | number
	latitude: number
	longitude: number
}

export type UserLocationTrackingMode = 'follow' | 'follow-bearing' | 'idle';
