'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricText } from '@/components/common/MetricText';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { Alert, Skeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineDemandRecordsData } from './useLineDemandRecordsData';

/* * */

const DAY_TYPES = ['weekday', 'saturday', 'sunday_holiday'] as const;

/* * */

export function LineDemandRecords() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const recordsData = useLineDemandRecordsData();
	const { line, records } = recordsData.data;
	const recordByDayType = useMemo(() => new Map(records.map(record => [record.day_type, record])), [records]);
	const content = recordsData.flags.has_error
		? <Alert color="red" variant="light">{t('lineDetail.demandDashboard.dashboardError')}</Alert>
		: recordsData.flags.is_loading
			? <Skeleton height={180} />
			: (
				<dl className={styles.records}>
					{DAY_TYPES.map((dayType) => {
						const record = recordByDayType.get(dayType);
						return (
							<div key={dayType} className={styles.record}>
								<dt>{t(`lineDetail.demandDashboard.records.dayTypes.${dayType}`)}</dt>
								<dd>
									<MetricText as="strong" format="compact" value={record?.passenger_demand} />
									{record
										? <MetricText format="operational-date" value={record.operational_date} />
										: <span>{t('lineDetail.demandDashboard.unavailable')}</span>}
								</dd>
							</div>
						);
					})}
				</dl>
			);

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.records.description')}
			title={t('lineDetail.demandDashboard.records.title')}
			action={(
				<PerformanceCsvExportButton
					datasets={[{ rows: records }]}
					disabled={recordsData.flags.has_error || recordsData.flags.is_loading || !records.length}
					filenameParts={[line?.code]}
					metadata={{ line_code: line?.code, line_id: line?._id }}
					visualizationId="demand-records"
				/>
			)}
		>
			{content}
		</DashboardCard>
	);

	//
}
