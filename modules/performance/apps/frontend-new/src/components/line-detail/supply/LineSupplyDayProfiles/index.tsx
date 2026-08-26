'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { type PlannedSupplyDayProfile } from '@tmlmobilidade/go-types-performance';
import { Section, SegmentedControl } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineSupplyDayProfilesProps { profiles: PlannedSupplyDayProfile[] }

/* * */

const DAY_TYPES = ['weekday', 'saturday', 'sunday_holiday'] as const;
function formatMinute(value: null | number) {
	if (value === null) return '—';
	const normalized = value % 1440;
	return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(Math.round(normalized % 60)).padStart(2, '0')}`;
}

function formatDuration(value: null | number) {
	if (value === null) return '—';
	return `${Math.floor(value / 60)}h${String(Math.round(value % 60)).padStart(2, '0')}`;
}

/* * */

export function LineSupplyDayProfiles({ profiles }: LineSupplyDayProfilesProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const [selectedDayType, setSelectedDayType] = useState<PlannedSupplyDayProfile['day_type']>('weekday');
	const profile = profiles.find(item => item.day_type === selectedDayType);

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.dayProfiles.description')}
			title={t('lineDetail.plannedSupply.dayProfiles.title')}
		>
			<Section gap="sm" padding="none">
				<SegmentedControl
					appearance="neutral"
					aria-label={t('lineDetail.plannedSupply.dayProfiles.dimensionLabel')}
					data={DAY_TYPES.map(dayType => ({ label: t(`lineDetail.plannedSupply.dayProfiles.types.${dayType}`), value: dayType }))}
					onChange={value => setSelectedDayType(value as PlannedSupplyDayProfile['day_type'])}
					size="sm"
					value={selectedDayType}
					fullWidth
				/>
				{profile ? (
					<dl className={styles.metrics}>
						<div><dt>{t('lineDetail.plannedSupply.dayProfiles.first')}</dt><dd>{formatMinute(profile.first_departure_minute)}</dd></div>
						<div><dt>{t('lineDetail.plannedSupply.dayProfiles.last')}</dt><dd>{formatMinute(profile.last_departure_minute)}</dd></div>
						<div><dt>{t('lineDetail.plannedSupply.dayProfiles.span')}</dt><dd>{formatDuration(profile.service_span_minutes)}</dd></div>
						<div><dt>{t('lineDetail.plannedSupply.dayProfiles.headway')}</dt><dd>{profile.median_headway_minutes === null ? '—' : `${formatters.decimal(profile.median_headway_minutes)} min`}</dd></div>
						<div><dt>{t('lineDetail.plannedSupply.dayProfiles.rides')}</dt><dd>{formatters.decimal(profile.average_scheduled_rides)}</dd></div>
						<div><dt>{t('lineDetail.plannedSupply.dayProfiles.vehicleKm')}</dt><dd>{formatters.decimal(profile.average_vehicle_km)} km</dd></div>
					</dl>
				) : <p className={styles.empty}>{t('lineDetail.plannedSupply.unavailable')}</p>}
			</Section>
		</DashboardCard>
	);

	//
}
