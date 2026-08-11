'use client';

import { type ScheduleProps } from '@mantine/schedule';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/types';
import { type ComponentPropsWithoutRef, type MouseEvent, useEffect, useState } from 'react';

/* * */

export interface CalendarScheduleDateRange {
	end: CalendarDate | null
	start: CalendarDate
}

/* * */

interface CalendarScheduleDateRangeStatus {
	isEnd: boolean
	isPreview: boolean
	isSelected: boolean
	isStart: boolean
}

interface UseCalendarScheduleDateRangeProps {
	enabled: boolean
	getDayProps?: NonNullable<ScheduleProps['yearViewProps']>['getDayProps']
	onChange?: (value: CalendarScheduleDateRange | null) => void
	onDayClick?: ScheduleProps['onDayClick']
	value?: CalendarScheduleDateRange | null
}

/* * */

export function getNextCalendarScheduleDateRange(
	current: CalendarScheduleDateRange | null | undefined,
	date: CalendarDate,
): CalendarScheduleDateRange {
	if (!current || current.end) return { end: null, start: date };

	return current.start <= date
		? { end: date, start: current.start }
		: { end: current.start, start: date };
}

export function getCalendarScheduleDateRangeStatus(
	date: CalendarDate,
	range: CalendarScheduleDateRange | null | undefined,
	hoveredDate: CalendarDate | null,
): CalendarScheduleDateRangeStatus {
	if (!range) return { isEnd: false, isPreview: false, isSelected: false, isStart: false };

	const effectiveEnd = range.end ?? hoveredDate;
	if (!effectiveEnd) {
		return {
			isEnd: false,
			isPreview: false,
			isSelected: date === range.start,
			isStart: date === range.start,
		};
	}

	const start = range.start <= effectiveEnd ? range.start : effectiveEnd;
	const end = range.start <= effectiveEnd ? effectiveEnd : range.start;

	return {
		isEnd: date === end,
		isPreview: !range.end && date >= start && date <= end,
		isSelected: date >= start && date <= end,
		isStart: date === start,
	};
}

/* * */

export function useCalendarScheduleDateRange({ enabled, getDayProps: getExternalDayProps, onChange, onDayClick, value }: UseCalendarScheduleDateRangeProps) {
	//

	//
	// A. Setup variables

	const [hoveredDate, setHoveredDate] = useState<CalendarDate | null>(null);

	//
	// B. Transform data

	const getDayProps = (dateValue: string) => {
		const date = toCalendarDate(dateValue.slice(0, 10));
		const externalDayProps = getExternalDayProps?.(dateValue) ?? {};
		const externalMouseProps = externalDayProps as Pick<ComponentPropsWithoutRef<'button'>, 'onMouseEnter' | 'onMouseLeave'>;
		const status = getCalendarScheduleDateRangeStatus(date, enabled ? value : null, hoveredDate);

		return {
			...externalDayProps,
			'aria-pressed': status.isSelected || undefined,
			'data-range-end': status.isEnd || undefined,
			'data-range-preview': status.isPreview || undefined,
			'data-range-selectable': enabled || undefined,
			'data-range-selected': status.isSelected || undefined,
			'data-range-start': status.isStart || undefined,
			'onMouseEnter': (event: MouseEvent<HTMLButtonElement>) => {
				externalMouseProps.onMouseEnter?.(event);
				if (!enabled || event.currentTarget.dataset.outside !== undefined || !value?.start || value.end) return;
				setHoveredDate(date);
			},
			'onMouseLeave': (event: MouseEvent<HTMLButtonElement>) => {
				externalMouseProps.onMouseLeave?.(event);
				if (hoveredDate === date) setHoveredDate(null);
			},
		};
	};

	//
	// C. Handle actions

	const handleDayClick: NonNullable<ScheduleProps['onDayClick']> = (dateValue, event) => {
		if (enabled && event.currentTarget.dataset.outside === undefined) {
			const date = toCalendarDate(dateValue.slice(0, 10));
			onChange?.(getNextCalendarScheduleDateRange(value, date));
		}

		onDayClick?.(dateValue, event);
	};

	useEffect(() => {
		setHoveredDate(null);
	}, [value?.end, value?.start]);

	return {
		getDayProps,
		handleDayClick,
		resetHover: () => setHoveredDate(null),
	};

	//
}
