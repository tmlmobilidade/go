'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent, CalendarEventType } from '@tmlmobilidade/types';
import React, { useCallback, useEffect, useRef } from 'react';

import styles from './styles.module.css';

import { Pane } from '../../panes';
import { CalendarGrid } from '../CalendarGrid';
import { CalendarHeader } from '../CalendarHeader';
import { CalendarSidebar } from '../CalendarSidebar';
import { YearlyCalendarMonth } from '../YearlyCalendarMonth';
import { useCalendarUIContext } from './index.context';

/* * */

export interface CalendarProps {
	eventTypes?: {
		checked: boolean
		color?: string
		count?: number
		id: CalendarEventType
		label: string
	}[]
	onDayClick?: (date: Dates) => void
	onEventClick?: (event: CalendarEvent) => void
	showSidebar?: boolean
}

/* * */

export function Calendar({
	eventTypes = [],
	onDayClick,
	onEventClick,
	showSidebar = true,
}: CalendarProps) {
	//

	// Get context
	const context = useCalendarUIContext();
	const { month, view, year } = context.state;
	const { eventsByMonth, filteredEvents, monthGrid, monthsData } = context.data;
	const { nextMonth, previousMonth, setMonth, setView, today } = context.actions;

	// Refs for wheel event handling
	const calendarRef = useRef<HTMLDivElement>(null);
	const isNavigatingRef = useRef(false);
	const lastNavigationRef = useRef(0);

	// Navigation handlers
	const handleNavigate = useCallback((newYear: number, newMonth: number) => {
		setMonth(newMonth, newYear);
	}, [setMonth]);

	const handleDayClick = useCallback((day) => {
		if (onDayClick) {
			onDayClick(day.date);
		}
		else {
			// If no callback provided, navigate to the day's month and switch to month view
			const jsDate = new Date(day.date.js_date);
			const dayMonth = jsDate.getMonth() + 1;
			const dayYear = jsDate.getFullYear();

			if (dayMonth !== month || dayYear !== year || view === 'year') {
				setMonth(dayMonth, dayYear);
				setView('month');
			}
		}
	}, [onDayClick, month, year, view, setMonth, setView]);

	const handleViewChange = useCallback((newView: 'month' | 'year') => {
		setView(newView);
	}, [setView]);

	const handleMonthClick = useCallback((clickedMonth: number) => {
		setMonth(clickedMonth, year);
		setView('month');
	}, [setMonth, setView, year]);

	const handleYearNavigate = useCallback((newYear: number) => {
		setMonth(month, newYear);
	}, [setMonth, month]);

	// Handle horizontal scroll/wheel events
	useEffect(() => {
		const calendarElement = calendarRef.current;
		if (!calendarElement || view === 'year') return;

		const handleWheel = (e: WheelEvent) => {
			// Only handle horizontal scroll or shift+vertical scroll
			const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

			if (isHorizontal) {
				e.preventDefault();

				// Prevent rapid navigation - minimum 300ms between navigations
				const now = Date.now();
				if (isNavigatingRef.current || now - lastNavigationRef.current < 300) {
					return;
				}

				const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
				const threshold = 30; // Lower threshold for more responsive feel

				if (Math.abs(delta) > threshold) {
					isNavigatingRef.current = true;
					lastNavigationRef.current = now;

					if (delta > 0) {
						// Scroll right = next month
						nextMonth();
					}
					else {
						// Scroll left = previous month
						previousMonth();
					}

					// Reset navigation flag after a short delay
					setTimeout(() => {
						isNavigatingRef.current = false;
					}, 100);
				}
			}
		};

		calendarElement.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			calendarElement.removeEventListener('wheel', handleWheel);
		};
	}, [view, year, month, nextMonth, previousMonth]);

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
						onNavigate={handleNavigate}
						onToday={today}
						onViewChange={handleViewChange}
						onYearNavigate={handleYearNavigate}
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
						<div className={styles.yearlyGrid}>
							{monthsData.map(({ grid, month: m }) => (
								<YearlyCalendarMonth
									key={m}
									events={eventsByMonth.get(m) || []}
									month={m}
									monthGrid={grid}
									onDayClick={handleDayClick}
									onEventClick={onEventClick}
									onMonthClick={() => handleMonthClick(m)}
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
