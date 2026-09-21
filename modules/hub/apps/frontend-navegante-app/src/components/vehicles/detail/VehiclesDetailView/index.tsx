'use client';

import { CopyBadge } from '@/components/common/display/CopyBadge';
import { useLinesData } from '@/components/lines/use-lines-data';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { getAgencyLogo } from '@/lib/agency-catalog';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { fetchApiData, LineBadge, LineName, Section } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function VehiclesDetailView() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: lines } = useLinesData();
	const vehiclesDetailContext = useVehiclesDetailContext();

	const [differenceInSeconds, setDifferenceInSeconds] = useState<number | undefined>(undefined);

	//
	// B. Fetch data

	const activePatternId = vehiclesDetailContext.data.vehicle?.route_id && vehiclesDetailContext.data.vehicle.direction_id !== undefined
		? `${vehiclesDetailContext.data.vehicle.route_id}_${vehiclesDetailContext.data.vehicle.direction_id}`
		: null;

	const { data: activePatternResponse } = useSWR<ApiResponse<HubV1ApiPattern[]>>(activePatternId ? API_ROUTES.hub.NETWORK_PATTERNS(activePatternId) : null, {
		fetcher: async url => await fetchApiData<HubV1ApiPattern[]>({ options: { credentials: 'omit' }, url }),
	});

	const activePatternData = activePatternResponse?.data;

	const activeHeadsign = useMemo(() => {
		return activePatternData?.[0]?.headsign ?? t('default:vehicles.VehiclesDetailView.headsign_unknown');
	}, [activePatternData, t]);

	const activeLineData = useMemo(() => {
		if (!vehiclesDetailContext.data.vehicle?.route_id) return;
		return lines.find(line => line._id === vehiclesDetailContext.data.vehicle?.route_id);
	}, [lines, vehiclesDetailContext.data.vehicle?.route_id]);

	useEffect(() => {
		const updateDifferenceInSeconds = () => {
			const nowUnixMilliseconds = Dates.now('local').unix_milliseconds;
			const differenceInMilliseconds = nowUnixMilliseconds - vehiclesDetailContext.data.vehicle?.created_at;
			const differenceInSeconds = differenceInMilliseconds / 1000;
			setDifferenceInSeconds(Math.round(differenceInSeconds));
		};
		updateDifferenceInSeconds();
		const interval = setInterval(updateDifferenceInSeconds, 1000);
		return () => clearInterval(interval);
	}, [vehiclesDetailContext.data.vehicle?.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<div className={styles.vehicleInfoWrapper}>

				<div className={styles.lineInfoWrapper}>
					<LineBadge color={activeLineData?.color} shortName={activeLineData?.short_name || vehiclesDetailContext.data.vehicle?.route_short_name} size="full-width" textColor={activeLineData?.text_color} />
					<Image alt="" height={40} src={getAgencyLogo(vehiclesDetailContext.data.vehicle?.agency_id, '180x120', 'light')} width={60} />
				</div>

				<LineName align="center" longName={t('default:vehicles.VehiclesDetailView.headsign', '', { headsign: activeHeadsign })} />

				<CopyBadge value={vehiclesDetailContext.data.vehicle?.vehicle_id} />

				{differenceInSeconds && <p className={styles.lastSeenLabel}>{t('default:vehicles.VehiclesDetailView.seen_seconds_ago', '', { count: differenceInSeconds })}</p>}

				<CopyBadge value={`${vehiclesDetailContext.data.vehicle?.bearing || '-'} | ${vehiclesDetailContext.data.vehicle?.bearing_method || '-'}`} />

			</div>
		</Section>
	);
}
