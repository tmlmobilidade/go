'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { useTranslations } from 'next-intl';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export interface CalendarEntry {
	date: string // e.g. "20250101"
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes: string
	period: '1' | '2' | '3'
}

export interface DayInfo {
	day_group: string
	day_type?: '1' | '2' | '3'
	holiday?: '0' | '1'
	notes?: string
}

/* * */

interface DatesContextState {
	actions: {
		refreshCalendar: () => Promise<void>
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

export const DatesContextProvider = ({ children }: { children: React.ReactNode }) => {
	//
	// A. Setup state

	const t = useTranslations();
	const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);

	//
	// B. Fetch calendar data

	const fetchCalendarData = async (): Promise<CalendarEntry[]> => {
		try {
			const response = await fetch(API_ROUTES.performance.DATES_LIST, { credentials: 'include' });
			if (!response.ok) return [];
			const body = await response.json();
			return (body?.data ?? body) as CalendarEntry[];
		}
		catch (error) {
			Logger.error({ error, message: `Error fetching calendar data` });
			return [];
		}
	};

	const refreshCalendar = async () => {
		setIsLoading(true);
		setIsError(false);
		try {
			const data = await fetchCalendarData();
			setCalendar(data);
		}
		catch {
			setIsError(true);
		}
		finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		refreshCalendar();
	}, []);

	//
	// C. Utils

	const buildCalendarMap = (calendarJson: CalendarEntry[]): Map<string, CalendarEntry> => {
		const calendarMap = new Map<string, CalendarEntry>();
		for (const entry of calendarJson) {
			const dateStr = entry.date.toString();
			if (dateStr.length !== 8) continue;
			const formatted = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
			calendarMap.set(formatted, entry);
		}
		return calendarMap;
	};

	const getDayDetails = (isoDate: string): CalendarEntry | null => {
		if (!calendar.length) return null;
		const map = buildCalendarMap(calendar);
		return map.get(isoDate.slice(0, 10)) ?? null;
	};

	const parseAndFormatDate = (iso: string) => {
		const dt = Dates.fromISO(iso);
		const formatted = t('dates.formatted', { date: dt.js_date });
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	};

	const getDayLabel = (day: DayInfo | string, withDetails = true): string => {
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
		}
		else {
			info = day;
		}

		if (!info.day_group) return '';
		const base = parseAndFormatDate(info.day_group);

		if (withDetails && info.holiday === '1') {
			const holidayText = info.notes?.length ? info.notes : t('dates.holiday');
			return `${base} (${holidayText})`;
		}

		return base;
	};

	const getDayShort = (day: DayInfo | string): string => {
		const iso = typeof day === 'string' ? day : day.day_group;
		if (!iso) return '';
		const dt = Dates.fromISO(iso);
		return dt.js_date.toLocaleDateString('pt-PT', {
			day: '2-digit',
			month: '2-digit',
			weekday: 'short',
		});
	};

	const getShortLabelFromDetailed = (detailed: string) => {
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
	};

	//
	// D. Compose context value

	const contextValue: DatesContextState = useMemo(() => ({
		actions: { refreshCalendar },
		data: { calendar },
		flags: { is_error: isError, is_loading: isLoading },
		utils: { getDayLabel, getDayShort, getShortLabelFromDetailed },
	}), [calendar, isLoading, isError, t]);

	//
	// E. Render provider

	return (
		<DatesContext.Provider value={contextValue}>
			{children}
		</DatesContext.Provider>
	);
};
