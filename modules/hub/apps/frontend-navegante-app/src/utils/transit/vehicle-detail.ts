import { type HubV1ApiLine, type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';

/* * */

type VehicleLineIdentity = Pick<HubV1ApiVehiclePosition, 'agency_id' | 'route_id' | 'route_short_name'>;
type VehiclePatternIdentity = Pick<HubV1ApiVehiclePosition, 'pattern_id'>;
type VehicleLine = Pick<HubV1ApiLine, 'agency_id' | 'route_ids' | 'short_name'>;

/* * */

export function getVehiclePatternId(vehicle: null | undefined | VehiclePatternIdentity): null | string {
	return vehicle?.pattern_id ?? null;
}

export function findVehicleLine<TLine extends VehicleLine>(vehicle: null | undefined | VehicleLineIdentity, lines: TLine[]): TLine | undefined {
	if (!vehicle) return;

	const routeId = vehicle.route_id;
	const routeMatch = routeId ? lines.find(line => line.agency_id === vehicle.agency_id && line.route_ids.includes(routeId)) : undefined;

	if (routeMatch || !vehicle.route_short_name) return routeMatch;

	return lines.find(line => line.agency_id === vehicle.agency_id && line.short_name === vehicle.route_short_name);
}
