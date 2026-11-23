'use client';

import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { ErrorDisplay, keepUrlParams, LoadingOverlay, Pane, Section, Select, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PeriodsCalendar } from '../PeriodsCalendar';
import { usePeriodsCalendarContext } from '../PeriodsCalendar.context';
import { PeriodsCalendarHeader } from '../PeriodsCalendarHeader';
import { PeriodsCalendarLegend } from '../PeriodsCalendarLegend';
import { usePeriodsCalendarAgency } from '../use-periods-calendar-agency';

/* * */

export function PeriodsOverview() {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();
	const { actions, data } = usePeriodsCalendarContext();
	const agency = usePeriodsCalendarAgency();
	const agencyIds = useMemo(() => agency.value ? [agency.value] : [], [agency.value]);
	const { data: periods, error, isLoading } = usePeriodsData();

	//
	// B. Transform data

	const visiblePeriods = useMemo(() => periods.filter(period => period.agency_ids.some(id => agencyIds.includes(id))), [periods, agencyIds]);
	const selectPeriod = (id: string) => router.push(keepUrlParams(PAGE_ROUTES.offer.YEAR_PERIODS_DETAIL(id)));

	//
	// C. Render components

	if (isLoading || agency.isLoading) return <LoadingOverlay />;
	if (error || agency.error) return <ErrorDisplay message={error ?? agency.error} />;
	return (
		<Pane>
			<Section gap="sm">
				<Select
					data={agency.options}
					label={t('shared:components.calendar.agency')}
					onChange={agency.set}
					value={agency.value}
					clearable
				/>
				<Text c="dimmed" size="sm">{t('default:periods.calendar.overviewHint')}</Text>
			</Section>
			<PeriodsCalendarHeader
				agencyIds={agencyIds}
				date={data.date}
				onDateChange={actions.setDate}
				periods={visiblePeriods}
			/>
			{visiblePeriods.length > 0 && <PeriodsCalendarLegend onSelect={selectPeriod} periods={visiblePeriods} />}
			<PeriodsCalendar
				agencyIds={agencyIds}
				date={data.date}
				onDateChange={actions.setDate}
				onPeriodSelect={selectPeriod}
				periods={visiblePeriods}
			/>
		</Pane>
	);
}
