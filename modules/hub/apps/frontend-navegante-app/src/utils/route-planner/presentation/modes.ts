import { type MotisLegModeKind, type MotisPlanLeg } from '@/types/route-planner/models';

/* * */

export function getMotisLegMode(leg: MotisPlanLeg) {
	return leg.mode.toUpperCase();
}

export function getMotisModeKind(value: string): MotisLegModeKind {
	const mode = value.toUpperCase();

	if (['FOOT', 'WALK'].includes(mode)) return 'walk';
	if (mode.includes('BUS')) return 'bus';
	if (mode.includes('BICYCLE') || mode.includes('BIKE')) return 'bike';
	if (mode.includes('CAR') || mode.includes('TAXI')) return 'car';
	if (mode.includes('SUBWAY') || mode.includes('METRO')) return 'subway';
	if (mode.includes('TRAM') || mode.includes('LIGHT_RAIL')) return 'tram';
	if (mode.includes('RAIL') || mode.includes('TRAIN')) return 'rail';
	if (mode.includes('FERRY') || mode.includes('BOAT')) return 'ferry';
	if (mode.includes('PLANE') || mode.includes('AIR')) return 'plane';
	if (mode.includes('SCOOTER')) return 'scooter';
	if (mode.includes('ELEVATOR')) return 'elevator';

	return 'transit';
}

export function getMotisLegModeKind(leg: MotisPlanLeg) {
	return getMotisModeKind(getMotisLegMode(leg));
}

export function getMotisLegRouteLabel(leg: MotisPlanLeg) {
	const explicitLabel = leg.routeShortName;
	if (explicitLabel) return explicitLabel;

	return getMotisLegMode(leg);
}

export function getMotisLegDisplayLabel(leg: MotisPlanLeg, getModeLabel: (mode: MotisLegModeKind) => string) {
	if (leg.routeShortName) return leg.routeShortName;
	return getModeLabel(getMotisLegModeKind(leg));
}

export function getMotisLegTitle(leg: MotisPlanLeg) {
	const mode = leg.mode;
	const route = leg.routeShortName || '';
	const headsign = leg.headsign || '';

	return [mode, route, headsign].filter(Boolean).join(' ');
}

export function isMotisWalkingLeg(leg: MotisPlanLeg) {
	return getMotisLegModeKind(leg) === 'walk';
}
