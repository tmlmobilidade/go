'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricText } from '@/components/common/MetricText';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { type PlannedSupplyDayProfile } from '@tmlmobilidade/go-types-performance';
import { Alert, Section, SegmentedControl, Skeleton } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineSupplyDayProfilesData } from './useLineSupplyDayProfilesData';

/* * */

const DAY_TYPES = ['weekday', 'saturday', 'sunday_holiday'] as const;

/* * */

export function LineSupplyDayProfiles() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const dayProfiles = useLineSupplyDayProfilesData();
	const [selectedDayType, setSelectedDayType] = useState<PlannedSupplyDayProfile['day_type']>('weekday');
	const { line, profiles } = dayProfiles.data;
	const profile = profiles.find(item => item.day_type === selectedDayType);
	const content = dayProfiles.flags.has_error
		? <Alert color="red" variant="light">{t('lineDetail.plannedSupply.dashboardError')}</Alert>
		: dayProfiles.flags.is_loading
			? <Skeleton height={220} />
			: (
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
							<div><dt>{t('lineDetail.plannedSupply.dayProfiles.first')}</dt><MetricText as="dd" format="clock-minutes" value={profile.first_departure_minute} /></div>
							<div><dt>{t('lineDetail.plannedSupply.dayProfiles.last')}</dt><MetricText as="dd" format="clock-minutes" value={profile.last_departure_minute} /></div>
							<div><dt>{t('lineDetail.plannedSupply.dayProfiles.span')}</dt><MetricText as="dd" format="duration-minutes" value={profile.service_span_minutes} /></div>
							<div><dt>{t('lineDetail.plannedSupply.dayProfiles.headway')}</dt><MetricText as="dd" format="decimal" suffix=" min" value={profile.median_headway_minutes} /></div>
							<div><dt>{t('lineDetail.plannedSupply.dayProfiles.rides')}</dt><MetricText as="dd" format="decimal" value={profile.average_scheduled_rides} /></div>
							<div><dt>{t('lineDetail.plannedSupply.dayProfiles.vehicleKm')}</dt><MetricText as="dd" format="decimal" suffix=" km" value={profile.average_vehicle_km} /></div>
						</dl>
					) : <p className={styles.empty}>{t('lineDetail.plannedSupply.unavailable')}</p>}
				</Section>
			);

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.dayProfiles.description')}
			title={t('lineDetail.plannedSupply.dayProfiles.title')}
			action={(
				<PerformanceCsvExportButton
					datasets={[{ rows: profiles }]}
					disabled={dayProfiles.flags.has_error || dayProfiles.flags.is_loading || !profiles.length}
					filenameParts={[line?.code]}
					metadata={{ line_code: line?.code, line_id: line?._id }}
					visualizationId="supply-day-profiles"
				/>
			)}
		>
			{content}
		</DashboardCard>
	);

	//
}
