'use client';

import { Dates, generateMonthGrid } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import styles from './styles.module.css';

import { Pane } from '../../panes';
import { CalendarGrid } from '../CalendarGrid';
import { CalendarHeader } from '../CalendarHeader';
import { CalendarSidebar } from '../CalendarSidebar';
import { useCalendarUIContext } from './index.context';

/* * */

export interface CalendarProps {
	events?: CalendarEvent[]
	eventTypes?: {
		checked: boolean
		color?: string
		count?: number
		id: string
		label: string
	}[]
	onDayClick?: (date: Dates) => void
	onEventClick?: (event: CalendarEvent) => void
	showSidebar?: boolean
}

/* * */

export function Calendar({
	events = [],
	eventTypes = [],
	onDayClick,
	onEventClick,
	showSidebar = true,
}: CalendarProps) {
	//

	// Get context
	const context = useCalendarUIContext();
	const { month, year } = context.state;
	const { nextMonth, previousMonth, setMonth, today } = context.actions;

	// Refs for wheel event handling
	const calendarRef = useRef<HTMLDivElement>(null);
	const isNavigatingRef = useRef(false);
	const lastNavigationRef = useRef(0);

	// Generate the month grid
	const monthGrid = useMemo(() => {
		return generateMonthGrid(year, month);
	}, [year, month]);

	// Navigation handlers
	const handleNavigate = useCallback((newYear: number, newMonth: number) => {
		setMonth(newMonth, newYear);
	}, [setMonth]);

	const handleDayClick = useCallback((day) => {
		if (onDayClick) {
			onDayClick(day.date);
		}
	}, [onDayClick]);

	// Handle horizontal scroll/wheel events
	useEffect(() => {
		const calendarElement = calendarRef.current;
		if (!calendarElement) return;

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
	}, [year, month, nextMonth, previousMonth]);

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
						year={year}
					/>
					<CalendarGrid
						events={events}
						onDayClick={handleDayClick}
						onEventClick={onEventClick}
						weeks={monthGrid.weeks}
					/>
				</div>
			</Pane>
		</div>
	);
}
