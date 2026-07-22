'use client';

import { RoutePlannerLocationFields } from '@/components/routes/input/RoutePlannerLocationFields';
import { RoutePlannerTravelTimeControls } from '@/components/routes/input/RoutePlannerTravelTimeControls';
import { type RoutePlannerLocation, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode } from '@/utils/route-planner-motis';

import styles from './styles.module.css';

/* * */

interface RoutePlannerInputProps {
	destination: null | RoutePlannerLocation
	onDestinationChange: (location: null | RoutePlannerLocation) => void
	onOriginChange: (location: null | RoutePlannerLocation) => void
	onSwap: () => void
	onTravelTimeChange: (date: Date) => void
	onTravelTimeModeChange: (mode: RoutePlannerTravelTimeMode) => void
	origin: null | RoutePlannerLocation
	travelTime: RoutePlannerTravelTime
	variant?: 'compact' | 'default'
	withTravelTimeControls?: boolean
}

/* * */

export function RoutePlannerInput({
	destination,
	onDestinationChange,
	onOriginChange,
	onSwap,
	onTravelTimeChange,
	onTravelTimeModeChange,
	origin,
	travelTime,
	variant = 'default',
	withTravelTimeControls = false,
}: RoutePlannerInputProps) {
	return (
		<div className={styles.wrapper} data-variant={variant}>
			<RoutePlannerLocationFields
				destination={destination}
				onDestinationChange={onDestinationChange}
				onOriginChange={onOriginChange}
				onSwap={onSwap}
				origin={origin}
				variant={variant}
			/>

			{withTravelTimeControls && (
				<RoutePlannerTravelTimeControls
					onTravelTimeChange={onTravelTimeChange}
					onTravelTimeModeChange={onTravelTimeModeChange}
					travelTime={travelTime}
				/>
			)}
		</div>
	);
}
