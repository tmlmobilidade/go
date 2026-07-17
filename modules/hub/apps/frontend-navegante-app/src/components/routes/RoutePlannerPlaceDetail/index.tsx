'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerItineraryCard } from '@/components/routes/RoutePlannerItineraryCard';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerPlaceDetail() {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const destination = routePlannerContext.data.destination;

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<div className={styles.placeHeader}>
				<h2>{destination?.label}</h2>
				{destination?.detail && <p>{destination.detail}</p>}
			</div>

			<h3>{t('default:routes.RoutePlanner.place_detail.how_to_get_here')}</h3>
			{routePlannerContext.flags.is_planning && <p>{t('default:routes.RoutePlanner.actions.planning')}</p>}
			{routePlannerContext.data.plan_error && <p className={styles.error}>{routePlannerContext.data.plan_error}</p>}
			<div className={styles.itineraries}>
				{routePlannerContext.data.itineraries.map((itinerary, index) => (
					<RoutePlannerItineraryCard
						itinerary={itinerary}
						key={`${itinerary.startTime || index}-${itinerary.endTime || index}`}
						onSelect={() => routePlannerContext.actions.selectItinerary(index)}
					/>
				))}
			</div>
		</div>
	);
}
