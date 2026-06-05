'use client';

/* * */

import { useLinesContext } from '@/components/lines/Lines.context';
import { CopyBadge } from '@/components/stops/detail/CopyBadge';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { LineBadge, LineName, Section } from '@tmlmobilidade/ui';
import { getPublicLineId } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';
/* * */

export function VehiclesDetailsContent() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
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

	const lastSeenLabel = (() => {
		if (!vehicle?.received_at) return;

		const now = Dates.now('Europe/Lisbon');
		const receivedAt = Dates.fromUnixTimestamp(vehicle.received_at).setZone('Europe/Lisbon', 'offset_only');

		if (now.toFormat('yyyyMMddHHmm') === receivedAt.toFormat('yyyyMMddHHmm')) {
			return t('default:vehicles.VehiclesDetailsContent.seen_just_now');
		}

		const minutesAgo = Math.max(1, Math.floor(now.diff(receivedAt, 'minute')));

		return t('default:vehicles.VehiclesDetailsContent.seen_minutes_ago', '', { count: minutesAgo });
	})();

	//
	// C. Render components

	return (
		<Section padding="md">
			<div className={styles.vehicleInfoWrapper}>
				<LineBadge color={activeLineData?.color} shortName={activeLineData?.short_name} size="full-width" textColor={activeLineData?.text_color} />
				<LineName align="center" longName={activeLineData?.long_name} />
				<CopyBadge value={vehicle?.vehicle_id} />
				<p className={styles.lastSeenLabel}>{lastSeenLabel}</p>
			</div>
		</Section>
	);

	//
}
