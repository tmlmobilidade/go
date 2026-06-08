'use client';

import { useLinesContext } from '@/components/lines/Lines.context';
import { CopyBadge } from '@/components/stops/detail/CopyBadge';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { AGENCY_LOGO_MAP } from '@/lib/agency-logos-map';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { HubPattern } from '@tmlmobilidade/types';
import { LineBadge, LineName, Section } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function VehiclesDetailView() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesContext = useLinesContext();
	const vehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Fetch data

	const { data: activePatternData } = useSWR<HubPattern[]>(vehiclesDetailContext.data.vehicle?.pattern_id && {
		credentials: 'omit',
		url: API_ROUTES.hub.NETWORK_PATTERNS(vehiclesDetailContext.data.vehicle.pattern_id),
	});

	const activeLineData = useMemo(() => {
		if (!vehiclesDetailContext.data.vehicle?.line_id) return;
		return linesContext.data.lines.find(line => line._id === vehiclesDetailContext.data.vehicle?.line_id);
	}, [linesContext.data.lines, vehiclesDetailContext.data.vehicle?.line_id]);

	const differenceInSeconds = useMemo(() => {
		if (!vehiclesDetailContext.data.vehicle?.created_at) return;
		const nowUnixTimestamp = Dates.now('Europe/Lisbon').unix_timestamp;
		const differenceInMilliseconds = nowUnixTimestamp - vehiclesDetailContext.data.vehicle?.created_at;
		const differenceInSeconds = differenceInMilliseconds / 1000;
		return Math.round(differenceInSeconds);
	}, [vehiclesDetailContext.data.vehicle?.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<div className={styles.vehicleInfoWrapper}>

				<div className={styles.lineInfoWrapper}>
					<LineBadge color={activeLineData?.color} shortName={activeLineData?.short_name} size="full-width" textColor={activeLineData?.text_color} />
					<Image alt="" height={40} src={AGENCY_LOGO_MAP[activeLineData?.agency_id]} width={60} />
				</div>

				<LineName align="center" longName={`Destino: ${activePatternData?.[0]?.headsign}`} />

				<CopyBadge value={vehiclesDetailContext.data.vehicle?.vehicle_id} />

				<p className={styles.lastSeenLabel}>{t('default:vehicles.VehiclesDetailView.seen_seconds_ago', '', { count: differenceInSeconds })}</p>

			</div>
		</Section>
	);
}
