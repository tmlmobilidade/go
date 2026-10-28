'use client';

import { getPeriodsDateCoverage } from '@/components/year-periods/shared/periods-date-coverage';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { type CalendarDate } from '@tmlmobilidade/go-types-shared';
import { ScheduleHeader, Tag, Text, Tooltip, useLocaleContext } from '@tmlmobilidade/ui';
import { type CalendarScheduleSources } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

const MAX_PREVIEW_RANGES = 6;

/* * */

export function PeriodsCalendarHeader({ agencyIds, date, onDateChange, periods, previewDates = [] }: { agencyIds: string[], date: CalendarDate, onDateChange: (date: string) => void, periods: NonNullable<CalendarScheduleSources['yearPeriods']>, previewDates?: CalendarDate[] }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const localeContext = useLocaleContext();
	const year = Number(date.slice(0, 4));

	//
	// B. Transform data

	const coverage = useMemo(() => getPeriodsDateCoverage({ agencyIds, periods, previewDates, year }), [agencyIds, periods, previewDates, year]);
	const formatter = new Intl.DateTimeFormat(localeContext.data.locale, { day: '2-digit', month: 'short', timeZone: 'UTC' });
	const formatDate = (date: string) => formatter.format(new Date(`${date}T00:00:00Z`));
	const hasMissingDates = coverage.missingDates.length > 0;
	const status = t(hasMissingDates ? 'default:periods.dateManagement.coverage.missing' : 'default:periods.dateManagement.coverage.complete', { count: coverage.missingDates.length });
	const remainingRanges = coverage.ranges.length - MAX_PREVIEW_RANGES;
	const tooltip = (
		<div className={styles.tooltip}>
			<strong>{status}</strong>
			{hasMissingDates && <span>{t('default:periods.dateManagement.coverage.description')}</span>}
			{coverage.ranges.slice(0, MAX_PREVIEW_RANGES).map(range => (
				<span key={range.start}>{range.start === range.end ? formatDate(range.start) : `${formatDate(range.start)} – ${formatDate(range.end)}`}</span>
			))}
			{remainingRanges > 0 && <span>{t('default:periods.dateManagement.coverage.moreRanges', { count: remainingRanges })}</span>}
		</div>
	);

	//
	// C. Render components

	return (
		<ScheduleHeader className={styles.header}>
			<ScheduleHeader.Previous aria-label={t('shared:components.calendar.previous')} className={styles.navigation} onClick={() => onDateChange(`${year - 1}-01-01`)} />
			<ScheduleHeader.Next aria-label={t('shared:components.calendar.next')} className={styles.navigation} onClick={() => onDateChange(`${year + 1}-01-01`)} />
			<Text fw={700} size="lg">{year}</Text>
			{agencyIds.length > 0 && (
				<Tooltip disabled={!hasMissingDates} events={{ focus: true, hover: true, touch: true }} label={tooltip} position="bottom-start" multiline withArrow>
					<div className={styles.status} role="status" tabIndex={hasMissingDates ? 0 : undefined}>
						<Tag
							icon={hasMissingDates ? <IconAlertTriangle size={16} aria-hidden /> : <IconCheck size={16} aria-hidden />}
							label={status}
							variant={hasMissingDates ? 'warning' : 'success'}
						/>
					</div>
				</Tooltip>
			)}
		</ScheduleHeader>
	);

	//
}
