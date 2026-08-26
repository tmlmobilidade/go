/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { type PassengerDemandRecord } from '@tmlmobilidade/go-types-performance';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDemandRecordsProps {
	records: PassengerDemandRecord[]
}

/* * */

const DAY_TYPES = ['weekday', 'saturday', 'sunday_holiday'] as const;

function formatOperationalDate(value: number, locale: string) {
	const raw = String(value);
	return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T12:00:00Z`));
}

/* * */

export function LineDemandRecords({ records }: LineDemandRecordsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const recordByDayType = new Map(records.map(record => [record.day_type, record]));

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.records.description')}
			title={t('lineDetail.demandDashboard.records.title')}
		>
			<dl className={styles.records}>
				{DAY_TYPES.map((dayType) => {
					const record = recordByDayType.get(dayType);
					return (
						<div key={dayType} className={styles.record}>
							<dt>{t(`lineDetail.demandDashboard.records.dayTypes.${dayType}`)}</dt>
							<dd>
								<strong>{record ? formatters.compact(record.passenger_demand) : '—'}</strong>
								<span>{record ? formatOperationalDate(record.operational_date, formatters.locale) : t('lineDetail.demandDashboard.unavailable')}</span>
							</dd>
						</div>
					);
				})}
			</dl>
		</DashboardCard>
	);

	//
}
