'use client';

/* * */

import { type CalendarEntry, useDatesData } from '@/hooks/use-dates-data';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useTranslations } from 'next-intl';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

/* * */

export type { CalendarEntry } from '@/hooks/use-dates-data';

export interface DayInfo {
	day_group: string
	day_type?: '1' | '2' | '3'
	holiday?: '0' | '1'
	notes?: string
}

/* * */

interface DatesContextState {
	actions: {
		refreshCalendar: () => void
	}
	data: {
		calendar: CalendarEntry[]
	}
	flags: {
		is_error: boolean
		is_loading: boolean
	}
	utils: {
		getDayLabel: (day: DayInfo | string, withDetails?: boolean) => string
		getDayShort: (day: DayInfo | string) => string
		getShortLabelFromDetailed: (detailed: string) => string
	}
}

/* * */

const DatesContext = createContext<DatesContextState | undefined>(undefined);

export function useDatesContext() {
	const context = useContext(DatesContext);
	if (!context) {
		throw new Error('useDatesContext must be used within a DatesContextProvider');
	}
	return context;
}

/* * */

export const DatesContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const t = useTranslations();

	//
	// B. Fetch data

	const { data: calendarData, error: calendarError, isLoading, mutate } = useDatesData();

	const calendar = useMemo(() => calendarData ?? [], [calendarData]);

	//
	// C. Transform data

	const calendarMap = useMemo(() => {
		const map = new Map<string, CalendarEntry>();
		for (const entry of calendar) {
			const dateStr = entry.date.toString();
			if (dateStr.length !== 8) continue;
			const formatted = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
			map.set(formatted, entry);
		}
		return map;
	}, [calendar]);

	const getDayDetails = useCallback((isoDate: string): CalendarEntry | null => {
		if (!calendar.length) return null;
		return calendarMap.get(isoDate.slice(0, 10)) ?? null;
	}, [calendar, calendarMap]);

	const parseAndFormatDate = useCallback((iso: string) => {
		const dt = Dates.fromISO(iso);
		const formatted = t('dates.formatted', { date: dt.js_date });
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	}, [t]);

	const getDayLabel = useCallback((day: DayInfo | string, withDetails = true): string => {
		let info: DayInfo;

		if (typeof day === 'string') {
			const details = getDayDetails(day);

			if (!details) return '';
			info = {
				day_group: day,
				day_type: details.day_type,
				holiday: details.holiday,
				notes: details.notes,
			};
		} else {
			info = day;
		}

		if (!info.day_group) return '';
		const base = parseAndFormatDate(info.day_group);

		if (withDetails && info.holiday === '1') {
			const holidayText = info.notes?.length ? info.notes : t('dates.holiday');
			return `${base} (${holidayText})`;
		}

		return base;
	}, [getDayDetails, parseAndFormatDate, t]);

	const getDayShort = useCallback((day: DayInfo | string): string => {
		const iso = typeof day === 'string' ? day : day.day_group;
		if (!iso) return '';
		const dt = Dates.fromISO(iso);
		return dt.js_date.toLocaleDateString('pt-PT', {
			day: '2-digit',
			month: '2-digit',
			weekday: 'short',
		});
	}, []);

	const getShortLabelFromDetailed = useCallback((detailed: string) => {
		if (!detailed) return '';
		const label = detailed.replace(/\s*\(.*\)$/, '');
		const match = label.match(/(\d{2})\s+de\s+([^\s]+)/i);
		if (!match) return label;

		const day = match[1];
		const monthName = match[2].toLowerCase();
		const monthMap: Record<string, string> = {
			abril: '04', agosto: '08', dezembro: '12', fevereiro: '02', janeiro: '01',
			julho: '07', junho: '06', maio: '05', março: '03', novembro: '11',
			outubro: '10', setembro: '09',
		};
		const month = monthMap[monthName] ?? '??';
		const weekdayMatch = label.match(/^([^\s,]+)/);
		const weekday = weekdayMatch ? weekdayMatch[1].slice(0, 3) : '';
		return `${weekday} ${day}/${month}`;
	}, []);

	//
	// D. Define context value

	const contextValue: DatesContextState = useMemo(() => ({
		actions: { refreshCalendar: mutate },
		data: { calendar },
		flags: { is_error: !!calendarError, is_loading: isLoading },
		utils: { getDayLabel, getDayShort, getShortLabelFromDetailed },
	}), [calendar, calendarError, getDayLabel, getDayShort, getShortLabelFromDetailed, isLoading, mutate]);

	//
	// E. Render components

	return (
		<DatesContext.Provider value={contextValue}>
			{children}
		</DatesContext.Provider>
	);

	//
};
