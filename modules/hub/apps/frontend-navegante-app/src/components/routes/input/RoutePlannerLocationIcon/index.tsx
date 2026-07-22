import { type RoutePlannerLocation } from '@/types/route-planner';
import { IconBuilding, IconBus, IconBusStop, IconMapPin, IconShip, IconTrain } from '@tabler/icons-react';

/* * */

interface RoutePlannerLocationIconProps {
	location: RoutePlannerLocation
}

/* * */

export function RoutePlannerLocationIcon({ location }: RoutePlannerLocationIconProps) {
	const modes = getNormalizedModes(location);

	if (modes.some(mode => ['LIGHT_RAIL', 'RAIL', 'SUBWAY', 'TRAIN', 'TRAM'].includes(mode))) return <IconTrain size={18} />;
	if (modes.some(mode => ['BOAT', 'FERRY'].includes(mode))) return <IconShip size={18} />;
	if (modes.includes('BUS')) return <IconBus size={18} />;
	if (location.type === 'STOP') return <IconBusStop size={18} />;
	if (location.type === 'ADDRESS') return <IconBuilding size={18} />;

	return <IconMapPin size={18} />;
}

/* * */

function getNormalizedModes(location: RoutePlannerLocation) {
	return Array.isArray(location.modes) ? location.modes.map(mode => mode.toUpperCase()) : [];
}
