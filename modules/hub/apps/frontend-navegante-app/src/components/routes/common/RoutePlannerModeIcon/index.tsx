import { getMotisLegModeKind, type MotisLegModeKind, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { IconBike, IconBus, IconCar, IconElevator, IconFerry, IconPlane, IconRoute, IconScooter, IconTrain, IconWalk, type TablerIcon } from '@tabler/icons-react';

/* * */

interface RoutePlannerModeIconProps {
	leg: MotisPlanLeg
	size: number
}

/* * */

const MODE_ICONS = {
	bike: IconBike,
	bus: IconBus,
	car: IconCar,
	elevator: IconElevator,
	ferry: IconFerry,
	plane: IconPlane,
	rail: IconTrain,
	scooter: IconScooter,
	subway: IconTrain,
	tram: IconTrain,
	transit: IconRoute,
	walk: IconWalk,
} satisfies Record<MotisLegModeKind, TablerIcon>;

/* * */

export function RoutePlannerModeIcon({ leg, size }: RoutePlannerModeIconProps) {
	const Icon = MODE_ICONS[getMotisLegModeKind(leg)];
	return <Icon size={size} />;
}
