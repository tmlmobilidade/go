'use client';

/* * */

import { useEventsContext } from '@/contexts/Events.context';
import { useHolidaysContext } from '@/contexts/Holidays.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { IconArrowBarToLeft, IconArrowBarToRight } from '@tabler/icons-react';
import { buildAffectedDaysDetails, calendarKey, CalendarKey, Dates, datesFromCalendarKey, FORMATS } from '@tmlmobilidade/dates';
import { CalendarEvent, HHMM, ScheduleRule } from '@tmlmobilidade/types';
import { CloseButton, DayPeriodsTimepoints, Divider, EventsCalendar, Pane, Section, Surface, Text } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

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

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<CalendarKey | null>(null);

	const periodsContext = usePeriodsContext();
	const eventsContext = useEventsContext();
	const holidaysContext = useHolidaysContext();
	const periods = periodsContext.data.raw;
	const holidays = holidaysContext.data.raw;

	// Compute which dates are affected by rules with their details
	const affectedDaysMap = useMemo(() => {
		const startOfYear = Dates.now('Europe/Lisbon').startOf('year').minus({ years: 1 });
		const endOfYear = startOfYear.plus({ years: 2 });
		return buildAffectedDaysDetails(startOfYear, endOfYear, rules, periods, holidays, {
			events: eventsContext.data.raw,
		});
	}, [eventsContext.data.raw, rules, periods, holidays]);

	// Convert affected dates to calendar events for visualization
	const calendarEvents = useMemo(() => {
		const events: CalendarEvent[] = Array.from(affectedDaysMap.keys()).map(key => ({
			color: 'var(--color-background)',
			display: 'cell' as const,
			endDate: key,
			id: `rule-impact:${key}`,
			startDate: key,
			title: 'Dia afetado por regras',
			type: 'rule-impact' as const,
		}));

		return events;
	}, [affectedDaysMap]);

	// Get detailed explanation for selected date
	const selectedDayDetails = useMemo(() => {
		if (!selectedDate) return null;
		return affectedDaysMap.get(selectedDate) || null;
	}, [selectedDate, affectedDaysMap]);

	const formattedSelectedDate = useMemo(() => {
		if (!selectedDate) return '';
		const date = datesFromCalendarKey(selectedDate);
		return date.toLocaleString(FORMATS.DATE_HUGE, 'pt-PT');
	}, [selectedDate]);

	//
	// B. Handle interactions

	const handleDayClick = (date: Dates) => {
		const key = calendarKey(date);
		const isAffectedDay = affectedDaysMap.has(key);

		if (isAffectedDay) {
			setSelectedDate(key);
			setIsDrawerOpen(true);
		}
	};

	const handleCloseDrawer = () => {
		setIsDrawerOpen(false);
	};

	//
	// C. Render components

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
				<Pane header={[<RulesCalendarPreviewHeader key="header" />]}>
					<EventsCalendar
						additionalEvents={calendarEvents}
						initialView="year"
						onDayClick={handleDayClick}
						showSidebar={false}
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
