'use client';

import { CopyBadge } from '@/components/common/display/CopyBadge';
import { useLinesData } from '@/components/lines/use-lines-data';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { useVehiclePatternData } from '@/components/vehicles/use-vehicle-pattern-data';
import { getAgencyLogo } from '@/lib/agency-catalog';
import { findVehicleLine, getVehiclePatternId } from '@/utils/transit/vehicle-detail';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { LineBadge, LineName, Section, Skeleton } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

	const activePatternId = getVehiclePatternId(vehiclesDetailContext.data.vehicle);
	const { data: activePatternData, isLoading: isPatternLoading } = useVehiclePatternData(activePatternId);

	const activeHeadsign = useMemo(() => {
		return activePatternData?.[0]?.headsign ?? null;
	}, [activePatternData]);

	const activeLineData = useMemo(() => {
		return findVehicleLine(vehiclesDetailContext.data.vehicle, lines);
	}, [lines, vehiclesDetailContext.data.vehicle]);

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

				{isPatternLoading
					? <Skeleton height={24} width={180} />
					: <LineName align="center" longName={t('default:vehicles.VehiclesDetailView.headsign', '', { headsign: activeHeadsign ?? t('default:vehicles.VehiclesDetailView.headsign_unknown') })} />}

				<CopyBadge value={vehiclesDetailContext.data.vehicle?.vehicle_id} />

				{differenceInSeconds && <p className={styles.lastSeenLabel}>{t('default:vehicles.VehiclesDetailView.seen_seconds_ago', '', { count: differenceInSeconds })}</p>}

				<CopyBadge value={`${vehiclesDetailContext.data.vehicle?.bearing || '-'} | ${vehiclesDetailContext.data.vehicle?.bearing_method || '-'}`} />

			</div>
		</Section>
	);
}
