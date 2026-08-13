'use client';

import { useAnnotationsContext } from '@/contexts/Annotations.context';
import { useEventsContext } from '@/contexts/Events.context';
import { useHolidaysContext } from '@/contexts/Holidays.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { IconArrowBarToLeft, IconArrowBarToRight, IconHandClick } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { buildAffectedDaysDetails, type CalendarKey, Dates, datesFromCalendarKey, FORMATS } from '@tmlmobilidade/dates';
import { type CalendarDate, type HHMM, type ScheduleRule, toCalendarDate } from '@tmlmobilidade/types';
import { AlertMessage, buildCalendarScheduleRuleImpactEvents, CalendarSchedule, type CalendarScheduleSources, CloseButton, DayPeriodsTimepoints, Divider, isCalendarSchedulePayload, Pane, type ScheduleEventData, Section, Surface, Text, useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

import { RulesCalendarPreviewHeader } from '../RulesCalendarPreviewHeader';
import { RulesGroup } from '../RulesCalendarPreviewRulesGroup';

/* * */

interface RulesCalendarPreviewProps {
	patternCode: string
	rules: ScheduleRule[]
}

/* * */

export function RulesCalendarPreview({ patternCode, rules }: RulesCalendarPreviewProps) {
	//

	//
	// A. Setup variables

	const localeContext = useLocaleContext();
	const annotationsContext = useAnnotationsContext();
	const eventsContext = useEventsContext();
	const holidaysContext = useHolidaysContext();
	const periodsContext = usePeriodsContext();
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<CalendarKey | null>(null);
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
		return date.toLocaleString(FORMATS.DATE_HUGE, localeContext.data.locale);
	}, [localeContext.data.locale, selectedDate]);

	//
	// C. Handle actions

	const handleVisibleDateChange = (value: string) => {
		setVisibleDate(toCalendarDate(value.slice(0, 10)));
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
		if (event.payload.type === 'event') route = PAGE_ROUTES.dates.EVENTS_DETAIL(event.payload.sourceId);
		if (event.payload.type === 'period') route = PAGE_ROUTES.dates.YEAR_PERIODS_DETAIL(event.payload.sourceId);

		if (route) window.open(route, '_blank', 'noopener,noreferrer');
	};

	const handleCloseDrawer = () => {
		setIsDrawerOpen(false);
	};

	//
	// D. Render components

	return (
		<div className={styles.container}>
			{/* Sidebar Toggle */}
			<div className={styles.sidebar} onClick={() => isDrawerOpen ? handleCloseDrawer() : setIsDrawerOpen(true)}>
				<div className={styles.sidebarContent}>
					{isDrawerOpen ? <IconArrowBarToRight /> : <IconArrowBarToLeft />}
				</div>
			</div>

			{/* Main Content */}
			<div className={styles.mainContent}>
				<Pane
					header={[
						<RulesCalendarPreviewHeader key="header" affectedDayCount={affectedDaysMap.size} patternCode={patternCode} />,
						<AlertMessage
							key="calendar-hint"
							icon={<IconHandClick size={20} />}
							title="Clique num dia afetado para consultar os horários e regras aplicáveis."
							variant="muted"
						/>,
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
						yearViewProps={{ viewSelectProps: { views: ['year'] } }}
					/>
				</Pane>
			</div>

			{/* Backdrop Overlay */}
			{isDrawerOpen && <div className={styles.backdrop} onClick={handleCloseDrawer} />}

			{/* Drawer - shows details for selected date */}
			<div className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
				<div className={styles.drawerHeader}>
					<CloseButton onClick={handleCloseDrawer} type="close" />
					<Text weight="semibold">{formattedSelectedDate}</Text>
				</div>

				<div className={styles.drawerContent}>
					{selectedDayDetails ? (
						<>
							{/* Time Points Summary */}
							<Surface style={{ flexShrink: 0 }}>
								<Section gap="sm">
									<Text size="lg" weight="semibold">
										{selectedDayDetails.finalTimePoints.length} horários ativos
									</Text>
									<Divider />
									<DayPeriodsTimepoints timepoints={selectedDayDetails.finalTimePoints as HHMM[]} />
								</Section>
							</Surface>

							{/* Applied Rules Details */}
							<Surface overflow="auto">
								<Section gap="sm">
									<Text size="lg" weight="semibold">Regras Aplicadas</Text>
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
					) : (
						<div className={styles.emptyState}>
							<Text c="muted">Selecione um dia no calendário</Text>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
