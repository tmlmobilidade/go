'use client';

import { type CreateAlertDto } from '@tmlmobilidade/types';

type DraftCoordinates = [number | undefined, number | undefined];

const hasFiniteNumber = (value: unknown): value is number => (
	typeof value === 'number'
	&& Number.isFinite(value)
);

/**
 * Coordinates are optional in alert create/detail forms.
 * When present, enforce global bounds.
 */
export function isValidOptionalAlertCoordinates(coordinates: CreateAlertDto['coordinates'] | DraftCoordinates | undefined): boolean {
	if (coordinates == null) return true;
	if (!Array.isArray(coordinates) || coordinates.length !== 2) return false;

	const [latitude, longitude] = coordinates;
	if (latitude == null && longitude == null) return true;
	if (!hasFiniteNumber(latitude) || !hasFiniteNumber(longitude)) return false;
	if (latitude < -90 || latitude > 90) return false;
	if (longitude < -180 || longitude > 180) return false;

	return true;
}

export function normalizeAlertCoordinatesInput(coordinates: DraftCoordinates | undefined): CreateAlertDto['coordinates'] | DraftCoordinates {
	if (!coordinates) return null;

	const [latitude, longitude] = coordinates;
	const hasLatitude = hasFiniteNumber(latitude);
	const hasLongitude = hasFiniteNumber(longitude);

	if (!hasLatitude && !hasLongitude) return null;
	if (hasLatitude && hasLongitude) return [latitude, longitude];
	return [hasLatitude ? latitude : undefined, hasLongitude ? longitude : undefined];
}
