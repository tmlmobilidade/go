'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent, CalendarEventType } from '@tmlmobilidade/types';
import React, { useCallback, useEffect, useRef } from 'react';

import styles from './styles.module.css';

import { Pane } from '../../../panes';
import { useCalendarUIContext } from '../../contexts/CalendarUI.context';
import { useRangeHover, useWheelNavigation } from '../../hooks';
import { CalendarGrid } from '../CalendarGrid';
import { CalendarHeader } from '../CalendarHeader';
import { CalendarSidebar } from '../CalendarSidebar';
import { YearlyCalendarMonth } from '../YearlyCalendarMonth';

/* * */

export interface CalendarProps {
	eventTypes?: {
		checked: boolean
		color?: string
		count?: number
		id: CalendarEventType
		label: string
	}[]
	initialView?: 'month' | 'year'
	onDayClick?: (date: Dates) => void
	onEventClick?: (event: CalendarEvent) => void
	onRangeSelect?: (range: { end: Dates, start: Dates }, clearSelection: () => void) => void
	showSidebar?: boolean
}

/* * */

export function Calendar({
	eventTypes = [],
	initialView = 'month',
	onDayClick,
	onEventClick,
	onRangeSelect,
	showSidebar = true,
}: CalendarProps) {
	//

	// Get context
	const context = useCalendarUIContext();
	const { month, rangeSelection, view, year } = context.state;
	const { eventsByMonth, filteredEvents, monthGrid, monthsData } = context.data;
	const { clearRangeSelection, nextMonth, previousMonth, setMonth, setRangeEnd, setRangeStart, setView, today } = context.actions;

	// Refs
	const calendarRef = useRef<HTMLDivElement>(null);
	const yearlyGridRef = useRef<HTMLDivElement>(null);

	// Set initial view
	useEffect(() => {
		setView(initialView);
	}, [initialView, setView]);

	// Day click handler - handles range selection in year view
	const handleDayClick = useCallback((day) => {
		// In year view, handle range selection
		if (view === 'year' && onRangeSelect) {
			const { end, start } = rangeSelection;

			// First click: set start
			if (!start) {
				setRangeStart(day.date);
			}
			// Second click: set end and finalize
			else if (start && !end) {
				let finalStart = start;
				let finalEnd = day.date;

				// Swap if end is before start
				if (finalEnd.operational_date < finalStart.operational_date) {
					[finalStart, finalEnd] = [finalEnd, finalStart];
				}

				setRangeEnd(finalEnd);

				// Fire the callback
				if (onRangeSelect) {
					onRangeSelect({ end: finalEnd, start: finalStart }, clearRangeSelection);
				}
			}
			// Third click: restart selection
			else {
				setRangeStart(day.date);
			}
		}
		// In month view or when onDayClick is provided
		else if (onDayClick) {
			onDayClick(day.date);
		}
		else {
			// If no callback provided, navigate to the day's month and switch to month view
			const jsDate = new Date(day.date.js_date);
			const dayMonth = jsDate.getMonth() + 1;
			const dayYear = jsDate.getFullYear();

			if (dayMonth !== month || dayYear !== year) {
				setMonth(dayMonth, dayYear);
				setView('month');
			}
		}
	}, [view, rangeSelection, onDayClick, onRangeSelect, setRangeStart, setRangeEnd, clearRangeSelection, month, year, setMonth, setView]);

	// Month click handler - navigate to clicked month in year view
	const handleMonthClick = useCallback((clickedMonth: number) => {
		setMonth(clickedMonth, year);
		setView('month');
	}, [setMonth, setView, year]);

	// Performance optimizations via custom hooks
	useRangeHover({
		containerRef: yearlyGridRef,
		isEnabled: view === 'year',
		rangeSelection,
	});

	useWheelNavigation({
		calendarRef,
		isEnabled: view === 'month',
		nextMonth,
		previousMonth,
	});

	return (
		<div className={styles.container}>
			{showSidebar && (
				<CalendarSidebar eventTypes={eventTypes} />
			)}

			<Pane>
				<div ref={calendarRef} className={styles.calendar}>
					<CalendarHeader
						month={month}
						monthName={monthGrid.monthName}
						onNavigate={setMonth}
						onToday={today}
						onViewChange={setView}
						onYearNavigate={newYear => setMonth(month, newYear)}
						view={view}
						year={year}
					/>
					{view === 'month' ? (
						<CalendarGrid
							events={filteredEvents}
							onDayClick={handleDayClick}
							onEventClick={onEventClick}
							weeks={monthGrid.weeks}
						/>
					) : (
						<div ref={yearlyGridRef} className={styles.yearlyGrid}>
							{monthsData.map(({ grid, month: m }) => (
								<YearlyCalendarMonth
									key={m}
									events={eventsByMonth.get(m) || []}
									month={m}
									monthGrid={grid}
									onDayClick={handleDayClick}
									onEventClick={onEventClick}
									onMonthClick={() => handleMonthClick(m)}
									rangeState={rangeSelection}
									year={year}
								/>
							))}
						</div>
					)}
				</div>
			</Pane>
		</div>
	);
}
