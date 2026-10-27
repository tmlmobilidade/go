'use client';

import { type ScheduleEventData } from '@mantine/schedule';
import { type MouseEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

import { filterCalendarScheduleEventsForDate } from '../../utils/calendar-schedule-event-range';

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

/** One delayed day summary, including when the pointer crosses an event overlay. */
export function useCalendarScheduleMonthPopover(events: ScheduleEventData[], date?: Date | string) {
	//

	// A. Setup variables

	const [state, setState] = useState<CalendarScheduleMonthPopoverState | null>(null);
	const openTimer = useRef<null | ReturnType<typeof setTimeout>>(null);
	const closeTimer = useRef<null | ReturnType<typeof setTimeout>>(null);
	const hoveredDate = useRef<null | string>(null);

	//
	// B. Handle actions

	const clearTimers = useCallback(() => {
		if (openTimer.current) clearTimeout(openTimer.current);
		if (closeTimer.current) clearTimeout(closeTimer.current);
		openTimer.current = null;
		closeTimer.current = null;
	}, []);

	const dismiss = useCallback(() => {
		clearTimers();
		hoveredDate.current = null;
		setState(null);
	}, [clearTimers]);

	const keepOpen = () => {
		clearTimers();
	};

	const scheduleClose = () => {
		clearTimers();
		hoveredDate.current = null;
		closeTimer.current = setTimeout(dismiss, 650);
	};

	const getDayState = (day: string, element: HTMLElement): CalendarScheduleMonthPopoverState | null => {
		const dayEvents = filterCalendarScheduleEventsForDate(events, day);
		if (!dayEvents.length) return null;
		const { height, left, top, width } = element.getBoundingClientRect();
		return { date: day, events: dayEvents, target: { height, left, top, width } };
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType !== 'mouse') return;
		// Events span multiple days in a separate layer. Resolve the day under the pointer.
		const dayElement = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-calendar-date]')).find((element) => {
			const rect = element.getBoundingClientRect();
			return event.clientX >= rect.left && event.clientX < rect.right && event.clientY >= rect.top && event.clientY < rect.bottom;
		});
		const day = dayElement?.dataset.calendarDate;
		if (!day || !dayElement) {
			scheduleClose();
			return;
		}
		if (hoveredDate.current === day) return;
		clearTimers();
		hoveredDate.current = day;
		if (state?.date === day) return;
		const nextState = getDayState(day, dayElement);
		// Keep the current summary reachable while crossing neighbouring cells.
		if (nextState) openTimer.current = setTimeout(() => setState(nextState), state ? 650 : 350);
		else closeTimer.current = setTimeout(dismiss, 650);
	};

	const getDayProps = (day: string) => ({
		'aria-expanded': state?.date === day,
		'aria-haspopup': 'dialog',
		'data-calendar-date': day,
		'data-overview-open': state?.date === day || undefined,
		'onClick': (event: MouseEvent<HTMLButtonElement>) => {
			clearTimers();
			hoveredDate.current = day;
			setState(getDayState(day, event.currentTarget));
		},
	});

	useEffect(() => {
		dismiss();
		return clearTimers;
	}, [events, date, dismiss, clearTimers]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') dismiss();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [dismiss]);

	return {
		actions: { dismiss, getDayProps, keepOpen, scheduleClose },
		containerProps: { onPointerLeave: scheduleClose, onPointerMove: handlePointerMove },
		state,
	};
}
