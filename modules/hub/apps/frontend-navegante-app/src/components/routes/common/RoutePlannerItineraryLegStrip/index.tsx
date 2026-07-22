'use client';

import { RoutePlannerLegStripItem } from '@/components/routes/common/RoutePlannerLegStripItem';
import { useLinesByShortName } from '@/hooks/route-planner/useLinesByShortName';
import { type MotisItinerary } from '@/types/route-planner/models';
import { getMotisLegMode } from '@/utils/route-planner/modes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerItineraryLegStripProps {
	itinerary: MotisItinerary
}

/* * */

export function RoutePlannerItineraryLegStrip({ itinerary }: RoutePlannerItineraryLegStripProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineByShortName = useLinesByShortName();

	//
	// B. Transform data

	const legs = useMemo(() => {
		return Array.isArray(itinerary.legs) ? itinerary.legs : [];
	}, [itinerary.legs]);

	//
	// C. Render components

	return (
		<div
			aria-label={t('default:routes.RoutePlanner.results.route_summary')}
			className={styles.routeStrip}
		>
			{legs.map((leg, legIndex) => (
				<RoutePlannerLegStripItem
					key={`${getMotisLegMode(leg)}-${legIndex}`}
					leg={leg}
					lineByShortName={lineByShortName}
					showConnector={legIndex < legs.length - 1}
				/>
			))}
		</div>
	);

	//
}
