'use client';

import { RoutePlannerTime } from '@/components/routes/common/RoutePlannerTime';
import { RoutePlannerItineraryDetailStep } from '@/components/routes/detail/RoutePlannerItineraryDetailStep';
import { type RoutePlannerTimeStatus } from '@/utils/route-planner/itinerary/realtime';
import { IconMapPinFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	destination: string
	time: RoutePlannerTimeStatus
}

/* * */

export function RoutePlannerItineraryArrivalStep({ destination, time }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	// B. Render components

	return (
		<RoutePlannerItineraryDetailStep marker={<span aria-label={t('default:routes.RoutePlanner.results.arrival_at_destination')} role="img"><IconMapPinFilled aria-hidden="true" size={20} /></span>}>
			<div className={styles.destination}>
				<strong>{destination}</strong>
				<RoutePlannerTime time={time} />
			</div>
		</RoutePlannerItineraryDetailStep>
	);
}
