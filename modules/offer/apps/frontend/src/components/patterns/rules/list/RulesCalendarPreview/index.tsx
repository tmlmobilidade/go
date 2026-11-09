'use client';

import { RulesDrawerLayout } from '@/components/patterns/rules/shared/RulesDrawerLayout';
import { useAnnotationsContext } from '@/contexts/Annotations.context';
import { useEventsContext } from '@/contexts/Events.context';
import { useHolidaysContext } from '@/contexts/Holidays.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type HHMM, type ScheduleRule } from '@tmlmobilidade/go-types-offer';
import { CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Dates, datesFromCalendarKey } from '@tmlmobilidade/go-utils-dates';
import { buildAffectedDaysDetails } from '@tmlmobilidade/go-utils-offer';
import { buildCalendarScheduleRuleImpactEvents, CalendarSchedule, CalendarScheduleSources, DayPeriodsTimepoints, Divider, isCalendarSchedulePayload, Pane, ScheduleEventData, Section, Surface, Text } from '@tmlmobilidade/ui';
import { useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { RulesCalendarPreviewHeader } from '../RulesCalendarPreviewHeader';
import { RulesGroup } from '../RulesCalendarPreviewRulesGroup';

/* * */

interface RulesCalendarPreviewProps {
	rules: ScheduleRule[]
}

/* * */

export function RulesCalendarPreview({ rules }: RulesCalendarPreviewProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const localeContext = useLocaleContext();
	const annotationsContext = useAnnotationsContext();
	const eventsContext = useEventsContext();
	const holidaysContext = useHolidaysContext();
	const periodsContext = usePeriodsContext();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
	const [visibleDate, setVisibleDate] = useState<CalendarDate>(() => Dates.now('local').calendar_date);
	const previewYear = Number(visibleDate.slice(0, 4));
	const periods = periodsContext.data.raw;
	const holidays = holidaysContext.data.raw;

	//
	// B. Transform data

	const affectedDaysMap = useMemo(() => {
		const startOfYear = Dates.fromISO(`${previewYear}-01-01`);
		const endOfYear = Dates.fromISO(`${previewYear}-12-31`);
		return buildAffectedDaysDetails(startOfYear, endOfYear, rules, periods, holidays, {
			events: eventsContext.data.raw,
		});
	}, [eventsContext.data.raw, rules, periods, holidays, previewYear]);

	const ruleImpactEvents = useMemo(
		() => buildCalendarScheduleRuleImpactEvents(Array.from(affectedDaysMap.keys())),
		[affectedDaysMap],
	);

	const sources = useMemo<CalendarScheduleSources>(() => ({
		annotations: annotationsContext.data.raw,
		events: eventsContext.data.raw,
		holidays: holidaysContext.data.raw,
		yearPeriods: periodsContext.data.raw,
	}), [annotationsContext.data.raw, eventsContext.data.raw, holidaysContext.data.raw, periodsContext.data.raw]);

	const selectedDayDetails = useMemo(() => {
		if (!selectedDate) return null;
		return affectedDaysMap.get(selectedDate) || null;
	}, [selectedDate, affectedDaysMap]);

	const formattedSelectedDate = useMemo(() => {
		if (!selectedDate) return '';
		const date = datesFromCalendarKey(selectedDate);
		const locale = localeContext.data.locale;
		const label = date.toLocaleString({ day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }, locale);
		return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
	}, [localeContext.data.locale, selectedDate]);

	//
	// C. Handle actions

	const handleVisibleDateChange = (value: string) => {
		const date = toCalendarDate(value.slice(0, 10));
		if (date.slice(0, 4) !== visibleDate.slice(0, 4)) {
			setSelectedDate(null);
			setIsDrawerOpen(false);
		}
		setVisibleDate(date);
	};

	const handleDayClick = (value: string) => {
		const date = toCalendarDate(value.slice(0, 10));
		const isAffectedDay = affectedDaysMap.has(date);

		if (isAffectedDay) {
			setSelectedDate(date);
			setIsDrawerOpen(true);
		}
	};

	const handleEventClick = (event: ScheduleEventData) => {
		if (!isCalendarSchedulePayload(event.payload)) return;

		let route: string | undefined;

		if (event.payload.type === 'annotation') route = PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'holiday') route = PAGE_ROUTES.dates.HOLIDAYS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'event') route = PAGE_ROUTES.offer.EVENTS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'period') route = PAGE_ROUTES.offer.YEAR_PERIODS_DETAIL(event.payload.sourceId);

		if (route) window.open(route, '_blank', 'noopener,noreferrer');
	};

	const handleCloseDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedDate(null);
	};

	//
	// D. Render components

	return (
		<RulesDrawerLayout
			drawerHeader={<Text weight="semibold">{formattedSelectedDate}</Text>}
			drawerSize="compact"
			isAvailable={Boolean(selectedDayDetails)}
			isOpen={isDrawerOpen}
			onClose={handleCloseDrawer}
			onOpen={() => setIsDrawerOpen(true)}
			toggleLabel={formattedSelectedDate}
			drawerContent={selectedDayDetails && (
				<>
					{/* Time Points Summary */}
					<Surface className={styles.daySummary}>
						<Section gap="sm">
							<Text size="lg" weight="semibold">
								{t('default:scheduling.copy.activeTimepointCount', '', { count: selectedDayDetails.finalTimePoints.length })}
							</Text>
							<Divider />
							<DayPeriodsTimepoints timepoints={selectedDayDetails.finalTimePoints as HHMM[]} />
						</Section>
					</Surface>

					{/* Applied Rules Details */}
					<Surface overflow="visible">
						<Section gap="sm">
							<Text size="lg" weight="semibold">{t('default:scheduling.copy.appliedRules')}</Text>
							<Divider />

							{selectedDayDetails.replacementRules.length > 0 && (
								<RulesGroup
									excludedTimePoints={selectedDayDetails.excludedTimePoints}
									includeRules={selectedDayDetails.includeRules}
									kind="replacement"
									rules={selectedDayDetails.replacementRules}
								/>
							)}

							<RulesGroup
								excludedTimePoints={selectedDayDetails.excludedTimePoints}
								includeRules={selectedDayDetails.includeRules}
								kind="include"
								rules={selectedDayDetails.includeRules}
							/>

							<RulesGroup
								excludedTimePoints={selectedDayDetails.excludedTimePoints}
								includeRules={selectedDayDetails.includeRules}
								kind="exclude"
								rules={selectedDayDetails.excludeRules}
							/>
						</Section>
					</Surface>
				</>
			)}
			overlaySidebar
		>
			<Pane
				header={[
					<RulesCalendarPreviewHeader key="header" affectedDayCount={affectedDaysMap.size} />,
				]}
			>
				<CalendarSchedule
					date={visibleDate}
					events={ruleImpactEvents}
					locale={localeContext.data.locale}
					onDateChange={handleVisibleDateChange}
					onDayClick={handleDayClick}
					onEventClick={handleEventClick}
					sources={sources}
					view="year"
					yearPeriodDisplay="muted"
					yearViewProps={{ viewSelectProps: { views: ['year'] } }}
				/>
			</Pane>
		</RulesDrawerLayout>
	);
}
