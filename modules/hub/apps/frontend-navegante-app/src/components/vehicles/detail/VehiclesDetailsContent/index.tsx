'use client';

/* * */

import { useLinesContext } from '@/components/lines/Lines.context';
import { CopyBadge } from '@/components/stops/detail/CopyBadge';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { LineBadge, LineName, Section } from '@tmlmobilidade/ui';
import { getPublicLineId } from '@tmlmobilidade/utils';
import { useMemo } from 'react';

import styles from './styles.module.css';
/* * */

export function VehiclesDetailsContent() {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const vehiclesDetailContext = useVehiclesDetailContext();
	const vehicle = vehiclesDetailContext.data.vehicle;

	//
	// B. Fetch data

	const activeLineData = useMemo(() => {
		if (!vehicle?.agency_id || !vehicle.line_id) return;

		const publicLineId = getPublicLineId(vehicle.agency_id, vehicle.line_id.trim());

		return linesContext.data.lines.find(line => line._id === publicLineId);
	}, [linesContext.data.lines, vehicle?.agency_id, vehicle?.line_id]);

	//
	// C. Render components

	return (
		<Section padding="md">
			<div className={styles.vehicleInfoWrapper}>
				<LineBadge color={activeLineData?.color} shortName={activeLineData?.short_name} textColor={activeLineData?.text_color} />
				<LineName longName={activeLineData?.long_name} />
				<CopyBadge value={vehicle?.vehicle_id} />
			</div>
		</Section>
	);

	//
}
