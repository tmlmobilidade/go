'use client';

import { type TickingCountSample, useTickingCount } from '@/lib/use-ticking-count';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import styles from './styles.module.css';

import { useLandingVehiclesData } from '../../map/LandingMap/use-landing-vehicles-data';
import { LandingStatCard } from '../LandingStatCard';

/* * */

export function LandingStats() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const localeContext = useLocaleContext();
	const { data: vehicles } = useLandingVehiclesData();
	const operatorsCount = useMemo(() => new Set(vehicles.map(vehicle => vehicle.agency_id)).size, [vehicles]);

	const { data: vehicleEvents } = useSWR<ApiResponse<TickingCountSample>>('https://go.tmlmobilidade.pt/hub/api/v1/metrics/vehicle-events/last-24h', {
		fetcher: async (url: string) => await fetchApiData<TickingCountSample>({ credentials: 'omit', url }),
		refreshInterval: 30_000,
	});
	const vehicleEventsCount = useTickingCount(vehicleEvents?.data) ?? 0;

	const thousandSeparator = new Intl.NumberFormat(localeContext.data.locale).formatToParts(1_000_000).find(part => part.type === 'group')?.value ?? ',';

	//
	// B. Render components

	return (
		<div className={styles.grid}>
			<LandingStatCard label={t('landing:LandingStats.vehicle_events')} thousandSeparator={thousandSeparator} value={vehicleEventsCount} isLive />
			<LandingStatCard label={t('landing:LandingStats.vehicles_live')} thousandSeparator={thousandSeparator} value={vehicles.length} isLive />
			<LandingStatCard label={t('landing:LandingStats.operators')} thousandSeparator={thousandSeparator} value={operatorsCount} isLive />
		</div>
	);

	//
}
