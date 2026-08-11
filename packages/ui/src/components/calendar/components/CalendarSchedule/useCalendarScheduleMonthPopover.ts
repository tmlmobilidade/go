'use client';

import { type ScheduleEventData } from '@mantine/schedule';
import { type FocusEvent, type MouseEvent, useEffect, useRef, useState } from 'react';

/* * */

export interface CalendarScheduleMonthPopoverState {
	date: string
	events: ScheduleEventData[]
	target: {
		height: number
		left: number
		top: number
		width: number
	}
}

/* * */

function getEventCalendarDate(value: Date | string) {
	return typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

/* * */

export function useCalendarScheduleMonthPopover(events: ScheduleEventData[]) {
	//

	//
	// A. Setup variables

	const [state, setState] = useState<CalendarScheduleMonthPopoverState | null>(null);
	const openTimeoutRef = useRef<null | number>(null);
	const closeTimeoutRef = useRef<null | number>(null);

	//
	// B. Handle actions

	const clearOpenTimeout = () => {
		if (openTimeoutRef.current === null) return;
		window.clearTimeout(openTimeoutRef.current);
		openTimeoutRef.current = null;
	};

	const clearCloseTimeout = () => {
		if (closeTimeoutRef.current === null) return;
		window.clearTimeout(closeTimeoutRef.current);
		closeTimeoutRef.current = null;
	};

	const close = () => {
		clearOpenTimeout();
		clearCloseTimeout();
		closeTimeoutRef.current = window.setTimeout(() => setState(null), 180);
	};

	const keepOpen = () => {
		clearCloseTimeout();
	};

	const open = (day: string, target: HTMLElement, delay: number) => {
		clearOpenTimeout();
		clearCloseTimeout();

		const dayEvents = events.filter(event => (
			getEventCalendarDate(event.start) <= day && day < getEventCalendarDate(event.end)
		));
		if (dayEvents.length === 0) {
			setState(null);
			return;
		}

		const { height, left, top, width } = target.getBoundingClientRect();
		const showOverview = () => setState({ date: day, events: dayEvents, target: { height, left, top, width } });

		if (delay === 0) {
			showOverview();
		} else {
			openTimeoutRef.current = window.setTimeout(showOverview, delay);
		}
	};

	const getDayProps = (day: string) => ({
		'aria-expanded': state?.date === day,
		'aria-haspopup': 'dialog',
		'data-calendar-date': day,
		'data-overview-open': state?.date === day || undefined,
		'onClick': (event: MouseEvent<HTMLButtonElement>) => open(day, event.currentTarget, 0),
		'onFocus': (event: FocusEvent<HTMLButtonElement>) => open(day, event.currentTarget, 0),
		'onMouseEnter': (event: MouseEvent<HTMLButtonElement>) => open(day, event.currentTarget, 150),
		'onMouseLeave': close,
	});

	useEffect(() => () => {
		if (openTimeoutRef.current !== null) window.clearTimeout(openTimeoutRef.current);
		if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
	}, []);

	return {
		actions: {
			close,
			getDayProps,
			keepOpen,
			setState,
		},
		state,
	};

	//
}
