'use client';

import { CopyBadge } from '@/components/common/display/CopyBadge';
import { DetailUnavailable } from '@/components/common/display/DetailUnavailable';
import { useLinesData } from '@/components/lines/use-lines-data';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { useVehiclePatternData } from '@/components/vehicles/use-vehicle-pattern-data';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { getAgencyLogo } from '@/lib/agency-catalog';
import { findVehicleLine, getVehiclePatternId } from '@/utils/transit/vehicle-detail';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { LineBadge, LineName, LoadingSection, Section, Skeleton } from '@tmlmobilidade/ui';
import Image from 'next/image';
import { type KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function VehiclesDetailView() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: lines } = useLinesData();
	const { push } = useBottomSheet();
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
		const vehicleCreatedAt = vehiclesDetailContext.data.vehicle?.created_at;
		if (!vehicleCreatedAt) {
			setDifferenceInSeconds(undefined);
			return;
		}

		const updateDifferenceInSeconds = () => {
			const nowUnixMilliseconds = Dates.now('local').unix_milliseconds;
			const differenceInMilliseconds = nowUnixMilliseconds - vehicleCreatedAt;
			const differenceInSeconds = differenceInMilliseconds / 1000;
			setDifferenceInSeconds(Math.round(differenceInSeconds));
		};
		updateDifferenceInSeconds();
		const interval = setInterval(updateDifferenceInSeconds, 1000);
		return () => clearInterval(interval);
	}, [vehiclesDetailContext.data.vehicle?.created_at]);

	//
	// C. Handle actions

	const handleLineDetailsOpen = () => {
		if (!activeLineData) return;
		push({ entityId: activeLineData._id, view: 'lines-detail' });
	};

	const handleLineBadgeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		handleLineDetailsOpen();
	};

	//
	// D. Render components

	if (vehiclesDetailContext.flags.is_loading) return <LoadingSection fullHeight />;

	if (vehiclesDetailContext.flags.has_error || vehiclesDetailContext.flags.is_not_found) {
		return <DetailUnavailable reason={vehiclesDetailContext.flags.has_error ? 'error' : 'not-found'} />;
	}

	return (
		<Section>
			<div className={styles.vehicleInfoWrapper}>

				<div className={styles.lineInfoWrapper}>
					{activeLineData ? (
						<div
							aria-label={t('default:vehicles.VehiclesDetailView.open_line_details', '', { line: activeLineData.short_name })}
							className={styles.lineBadgeButton}
							onClick={handleLineDetailsOpen}
							onKeyDown={handleLineBadgeKeyDown}
							role="button"
							tabIndex={0}
						>
							<LineBadge color={activeLineData.color} shortName={activeLineData.short_name} size="full-width" textColor={activeLineData.text_color} />
						</div>
					) : (
						<LineBadge shortName={vehiclesDetailContext.data.vehicle?.route_short_name} size="full-width" />
					)}
					<Image alt="" height={40} src={getAgencyLogo(vehiclesDetailContext.data.vehicle?.agency_id, '180x120', 'light')} width={60} />
				</div>

				{isPatternLoading
					? <Skeleton height={24} width={180} />
					: <LineName align="center" longName={t('default:vehicles.VehiclesDetailView.headsign', '', { headsign: activeHeadsign ?? t('default:vehicles.VehiclesDetailView.headsign_unknown') })} />}

				<CopyBadge value={vehiclesDetailContext.data.vehicle?.vehicle_id} />

				{differenceInSeconds !== undefined && <p className={styles.lastSeenLabel}>{t('default:vehicles.VehiclesDetailView.seen_seconds_ago', '', { count: differenceInSeconds })}</p>}
				{vehiclesDetailContext.flags.is_stale && <p className={styles.lastSeenLabel}>{t('default:vehicles.VehiclesDetailView.stale')}</p>}

				<CopyBadge value={`${vehiclesDetailContext.data.vehicle?.bearing || '-'} | ${vehiclesDetailContext.data.vehicle?.bearing_method || '-'}`} />

			</div>
		</Section>
	);
}
