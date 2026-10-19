import { type MotisPlanPlace } from '@tmlmobilidade/go-types-motis';

/* * */

export function isSameRoutePlannerPlace(first: MotisPlanPlace | undefined, second: MotisPlanPlace | undefined) {
	if (!first || !second) return false;
	if (first.stopId && second.stopId) return first.stopId === second.stopId;
	const firstName = first.name.trim().toLocaleLowerCase();
	return firstName.length > 0 && firstName === second.name.trim().toLocaleLowerCase();
}
