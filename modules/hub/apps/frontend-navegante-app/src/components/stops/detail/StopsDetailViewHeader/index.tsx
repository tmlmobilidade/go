'use client';

import { SelectOperationalDate } from '@/components/common/operational-date/SelectOperationalDate';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailViewHeaderAssociatedLines } from '@/components/stops/detail/StopsDetailViewHeaderAssociatedLines';
import { StopsDetailViewHeaderMetadata } from '@/components/stops/detail/StopsDetailViewHeaderMetadata';
import { StopsDetailViewName } from '@/components/stops/detail/StopsDetailViewName';
import { formatStopLocation } from '@/utils/transit/format-stop-location';
import { IconDirections } from '@tabler/icons-react';
import { Section, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailViewHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const stopsDetailContext = useStopsDetailContext();
	const stop = stopsDetailContext.data.stop;

	//
	// B. Handle actions

	const handleGetDirections = () => {
		void routePlannerContext.actions.openDirectionsTo({
			detail: formatStopLocation(stop.locality_name ?? undefined, stop.municipality_name) ?? '',
			id: `GTFS_${String(stop._id).replace(/^GTFS_/, '')}`,
			label: stop.name,
			lat: stop.latitude,
			lon: stop.longitude,
			type: 'STOP',
		});
	};

	//
	// C. Render components

	return (
		<Surface variant="plain">
			<Section gap="sm">
				<StopsDetailViewName />
				<StopsDetailViewHeaderMetadata />
				<button className={styles.directionsButton} onClick={handleGetDirections} type="button">
					<IconDirections aria-hidden="true" size={24} stroke={2.25} />
					{t('default:stops.StopsDetail.actions.get_directions')}
				</button>
				<StopsDetailViewHeaderAssociatedLines />
				<SelectOperationalDate />
			</Section>
		</Surface>
	);

	//
}
