/* eslint-disable @typescript-eslint/naming-convention */

import { CALENDAR_DATE_FORMAT, type DatesFormat, FORMATS, OPERATIONAL_DATE_FORMAT } from '@/lib/date-format.js';
import { type TimezoneIdentified, TimezoneIdentifiedSchema, TimezoneIdentifiedValues } from '@/lib/timezone-identified.js';
import { CalendarDate, type OperationalDate, type UnixTimestamp } from '@tmlmobilidade/types';
import { type DateObjectUnits, DateTime, type DateTimeUnit, type DurationObjectUnits } from 'luxon';

/* * */

interface DatesConstructor {
	calendar_date: CalendarDate
	iso: null | string
	js_date: Date
	operational_date: OperationalDate
	std_window: { end: UnixTimestamp, start: UnixTimestamp }
	unix_timestamp: UnixTimestamp
}

export interface CalendarEntry {
	date: string
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes: string
	period: '1' | '2' | '3'
}

/* * */

export class Dates {
	//

	static readonly standardWindowHours = 10;

	public calendar_date: CalendarDate;
	public iso: null | string;
	public js_date: Date;
	public operational_date: OperationalDate;
	public std_window: { end: UnixTimestamp, start: UnixTimestamp };
	public unix_timestamp: UnixTimestamp;

	constructor(params: DatesConstructor) {
		this.calendar_date = params.calendar_date;
		this.iso = params.iso ?? null;
		this.js_date = params.js_date;
		this.operational_date = params.operational_date;
		this.std_window = params.std_window;
		this.unix_timestamp = params.unix_timestamp;
	}

	static get FORMATS() { return FORMATS; }

	static get TIMEZONE_LIST() { return TimezoneIdentifiedValues; }

	static get TIMEZONE_LIST_VALUES() { return TimezoneIdentifiedSchema.Values; }

	/**
	 * Creates a Dates object from a date/time string in a specific format.
	 * @param text The date/time string to parse.
	 * @param format The format string to use for parsing the date/time.
	 *   See Luxon documentation for format tokens: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
	 * @param timezone The timezone to set for the Dates object.
	 * @returns A new Dates object parsed from the string.
	 */
	static fromFormat(text: string, format: string, timezone: 'local' | 'utc' | TimezoneIdentified): Dates {
		const dateTime = DateTime
			.fromFormat(text, format, { setZone: true })
			.setZone(timezone, { keepLocalTime: true });
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.prototype.getOperationalDate(dateTime.toISO()),
			std_window: this.prototype.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Creates a Dates object from an ISO 8601 date/time string.
	 * This method assumes the string has a timezone offset.
	 * @param isoText The ISO 8601 date/time string to parse.
	 * @returns A new Dates object created from the ISO string.
	 */
	static fromISO(isoText: string): Dates {
		const dateTime = DateTime.fromISO(isoText, { setZone: true });
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.prototype.getOperationalDate(dateTime.toISO()),
			std_window: this.prototype.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Creates a Dates object from a JavaScript Date object.
	 * @param date The JavaScript Date object to convert. It is assumed that the date is in UTC.
	 * @returns A new Dates object created from the JavaScript Date.
	 */
	static fromJSDate(date: Date): Dates {
		const dateTime = DateTime
			.fromJSDate(date)
			.setZone('utc', { keepLocalTime: false });
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.prototype.getOperationalDate(dateTime.toISO()),
			std_window: this.prototype.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Creates a Dates object from an operational date string in 'yyyyMMdd' format.
	 * @param date The operational date string in 'yyyyMMdd' format or an OperationalDate object.
	 * @param timezone The timezone to set for the Dates object.
	 * @returns A new Dates object created from the operational date.
	 */
	static fromOperationalDate(date: OperationalDate | string, timezone: 'local' | 'utc' | TimezoneIdentified): Dates {
		const dateTime = DateTime
			.fromFormat(date, OPERATIONAL_DATE_FORMAT)
			.setZone(timezone, { keepLocalTime: true })
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 }); // Start of the operational date
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.prototype.getOperationalDate(dateTime.toISO()),
			std_window: this.prototype.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Creates a Dates object from Unix epoch seconds
	 * @param seconds The number of seconds since Unix epoch
	 * @returns A new Dates object created from the seconds timestamp
	 */
	static fromSeconds(seconds: number): Dates {
		const dateTime = DateTime
			.fromSeconds(seconds)
			.setZone('utc', { keepLocalTime: false });
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.prototype.getOperationalDate(dateTime.toISO()),
			std_window: this.prototype.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Creates a Dates object from Unix epoch in milliseconds.
	 * @param millis The number of milliseconds since Unix epoch. Unix timestamp is always in UTC.
	 * @returns A new Dates object created from the milliseconds timestamp.
	 */
	static fromUnixTimestamp(millis: number | UnixTimestamp): Dates {
		const dateTime = DateTime
			.fromMillis(millis)
			.setZone('utc', { keepLocalTime: false });
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.prototype.getOperationalDate(dateTime.toISO()),
			std_window: this.prototype.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Creates a Dates object with the current date and time.
	 * @param timezone The timezone to set for the Dates object.
	 * @returns A new Dates object with the current date and time in the specified timezone.
	 */
	static now(timezone: 'local' | 'utc' | TimezoneIdentified): Dates {
		const dateTime = DateTime
			.now()
			.setZone(timezone, { keepLocalTime: false });
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.prototype.getOperationalDate(dateTime.toISO()),
			std_window: this.prototype.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Fetches calendar data from the public API
	 * Returns an empty array if the request fails
	 */
	static async fetchCalendarData(): Promise<CalendarEntry[]> {
		try {
			let calendarJson: CalendarEntry[] = [];
			const response = await fetch('https://go.carrismetropolitana.pt/api/dates/public');
			calendarJson = !response.ok ? [] : await response.json() as CalendarEntry[];
			return calendarJson;
		} catch (error) {
			console.error('Error fetching calendar data:', error);
		}
	}

	/**
	 * Returns the difference between this date and another date.
	 * @param other The other Dates object to compare with
	 * @param unit The unit of time to return the difference in (defaults to 'day')
	 * @returns The difference as a number in the specified unit
	 */
	diff(other: Dates, unit: DateTimeUnit = 'day'): number {
		if (!this.iso || !other.iso) throw new Error('ISO date is not set.');
		const thisDateTime = DateTime.fromISO(this.iso, { setZone: true });
		const otherDateTime = DateTime.fromISO(other.iso, { setZone: true });

		return thisDateTime.diff(otherDateTime, unit).as(unit);
	}

	/**
	 * Returns a new Dates object with the end of the specified unit.
	 * @param unit The unit to set the end of, e.g., 'day', 'month', 'year', etc.
	 * @returns A new Dates object with the end of the specified unit.
	 */
	endOf(unit: DateTimeUnit): Dates {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime
			.fromISO(this.iso, { setZone: true })
			.endOf(unit);
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.getOperationalDate(dateTime.toISO()),
			std_window: this.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Returns a new Dates object with the current date and time minus a duration.
	 * @param duration The duration to subtract
	 * @returns A new Dates object with the current date and time minus a duration
	 */
	minus(duration: DurationObjectUnits): Dates {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime
			.fromISO(this.iso, { setZone: true })
			.minus(duration);
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.getOperationalDate(dateTime.toISO()),
			std_window: this.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Returns a new Dates object with the current date and time plus a duration
	 * @param duration The duration to add
	 * @returns A new Dates object with the current date and time plus a duration
	 */
	plus(duration: DurationObjectUnits): Dates {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime
			.fromISO(this.iso, { setZone: true })
			.plus(duration);
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.getOperationalDate(dateTime.toISO()),
			std_window: this.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Sets the date and time for the Dates object.
	 * @param dateOrTime The date or time to set, can be an object with DateObjectUnits or a string in ISO format.
	 * @returns The Dates object
	 */
	set(dateOrTime: DateObjectUnits): Dates {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime
			.fromISO(this.iso, { setZone: true })
			.set(dateOrTime);
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.getOperationalDate(dateTime.toISO()),
			std_window: this.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Sets the timezone for the Dates object.
	 * @param timezone The timezone to set in the format of an IANA timezone.
	 * @param method The method to use for updating the timezone information.
	 *   - `offset_only` Updates only offset setting to the new timezone. The ISO string will show adjusted time components (hour, minutes, etc.) to their equivalent in the new timezone. The UTC value in milliseconds stays the same. The UNIX timestamp is the source of truth.
	 *   - `rebase_utc` Keeps the individual time components (hour, minutes, etc.) and updates the internal UTC value in milliseconds to reflect the change. The ISO string will show the same time components as before, but the UTC value in milliseconds will be adjusted to match the new timezone. The ISO string is the source of truth.
	 * @returns The Dates object
	 */
	setZone(timezone: 'local' | 'utc' | TimezoneIdentified, method: 'offset_only' | 'rebase_utc'): Dates {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime
			.fromISO(this.iso, { setZone: true })
			.setZone(timezone, { keepLocalTime: method === 'rebase_utc' });
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.getOperationalDate(dateTime.toISO()),
			std_window: this.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Returns a new Dates object with the start of the specified unit.
	 * @param unit The unit to set the start of, e.g., 'day', 'month', 'year', etc.
	 * @returns A new Dates object with the start of the specified unit.
	 */
	startOf(unit: DateTimeUnit): Dates {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime
			.fromISO(this.iso, { setZone: true })
			.startOf(unit);
		return new Dates({
			calendar_date: dateTime.toFormat(CALENDAR_DATE_FORMAT) as CalendarDate,
			iso: dateTime.toISO(),
			js_date: dateTime.toJSDate(),
			operational_date: this.getOperationalDate(dateTime.toISO()),
			std_window: this.getStandardWindowInterval(dateTime.toISO()),
			unix_timestamp: dateTime.toMillis() as UnixTimestamp,
		});
	}

	/**
	 * Returns the time remaining until a given unix_timestamp (in ms) from now,
	 * as an object with minutes, hours, and days (all as floats, not rounded).
	 * @param unixTimestamp The target timestamp in milliseconds
	 * @returns { minutes: number, hours: number, days: number }
	 */
	timeUntil(unixTimestamp: UnixTimestamp): { days: number, hours: number, minutes: number } {
		// Calculate the difference in milliseconds
		const now = Date.now();
		const diffMs = unixTimestamp - now;
		// Calculate the time remaining
		const minutes = diffMs / (1000 * 60);
		const hours = diffMs / (1000 * 60 * 60);
		const days = diffMs / (1000 * 60 * 60 * 24);
		// Return the time components
		return { days, hours, minutes };
	}

	/**
	 * Returns a human-readable, localized string for the time remaining until a given unix_timestamp (in ms) from now.
	 * @param unixTimestamp The target timestamp in milliseconds
	 * @param locale Optional locale string (e.g., 'en', 'pt')
	 * @returns A localized string like "2 days, 3 hours, 15 minutes"
	 */
	timeUntilLocaleString(unixTimestamp: UnixTimestamp, locale: 'en' | 'pt' = 'pt'): string {
		const now = Date.now();
		const diffMs = unixTimestamp - now;

		const parts: string[] = [];

		if (diffMs < 60 * 1000) {
			return locale === 'en' ? 'Arriving' : 'A Chegar';
		}

		const totalMinutes = Math.round(diffMs / (1000 * 60));
		const days = Math.floor(totalMinutes / (60 * 24));
		const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
		const minutes = totalMinutes % 60;

		if (days > 0) {
			parts.push(`${days} ${days === 1 ? locale === 'en' ? 'day' : 'dia' : locale === 'en' ? 'days' : 'dias'}`);
		}
		if (hours > 0) {
			parts.push(`${hours} ${hours === 1 ? locale === 'en' ? 'hour' : 'hora' : locale === 'en' ? 'hours' : 'horas'}`);
		}
		if (minutes > 0 || parts.length === 0) {
			parts.push(`${minutes} ${minutes === 1 ? locale === 'en' ? 'minute' : 'minuto' : locale === 'en' ? 'minutes' : 'minutos'}`);
		}

		return parts.join(', ');
	}

	/**
	 * Returns the date as a string in the specified format.
	 * @param format The format string (see Luxon tokens documentation)
	 * @param opts Optional formatting options (e.g., { locale: 'pt' })
	 * @returns The date as a string in the specified format
	 */
	toFormat(format: string, opts?: { locale?: string }): string {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime.fromISO(this.iso, { setZone: true });
		return dateTime.setLocale(opts?.locale || 'pt').toFormat(format);
	}

	/**
	 * Returns the date as a string in the specified format.
	 * @param format The format string (see Luxon tokens documentation)
	 * @returns The date as a string in the specified format
	 */
	toLocaleString(format: DatesFormat, locale?: string): string {
		if (!this.iso) throw new Error('ISO date is not set.');
		const dateTime = DateTime.fromISO(this.iso, { setZone: true });
		if (locale) dateTime.setLocale(locale);
		return dateTime.toLocaleString(format, { locale: locale });
	}

	/**
	 * Returns the operational date based on the provided timestamp and format.
	 * @param timestamp - The timestamp to be parsed.
	 * @returns The operational date in the yyyyLLdd format.
	 */
	private getOperationalDate(isoDate: null | string): OperationalDate {
		// Skip if the ISO date is not set
		if (!isoDate) throw new Error('ISO date is not set.');
		// Get the date object
		const dateObject = DateTime.fromISO(isoDate, { setZone: true });
		// Check if the time is between 00:00 and 03:59.
		// The operational date is between 04:00 and 03:59 of the following day.
		let operationalDate: string;
		if (dateObject.hour < 4) {
			// If true, unwind the clock by 12 hours to
			// return the previous day in the yyyyLLdd format
			const previousDay = dateObject.minus({ hours: 12 });
			operationalDate = previousDay.toFormat(OPERATIONAL_DATE_FORMAT);
		} else {
			// Else, return the current day in the yyyyLLdd format
			operationalDate = dateObject.toFormat(OPERATIONAL_DATE_FORMAT);
		}
		// Return the date as an operational date
		return operationalDate as OperationalDate;
	}

	/**
	 * This function returns the start and end of the standard window interval for a given timestamp.
	 * The standard window interval is the period in which is possible to receive data for a given ride.
	 * Currently, the standard window starts 10 hours before and ends 10 hours after the scheduled ride start.
	 * @param isoDate The ISO date string to calculate the standard window interval.
	 * @returns An object containing the start and end of the standard window interval.
	 */
	private getStandardWindowInterval(isoDate: null | string): { end: UnixTimestamp, start: UnixTimestamp } {
		if (!isoDate) throw new Error('ISO date is not set.');
		const dateTime = DateTime.fromISO(isoDate, { setZone: true });
		return {
			end: dateTime.plus({ hours: Dates.standardWindowHours }).toMillis() as UnixTimestamp,
			start: dateTime.minus({ hours: Dates.standardWindowHours }).toMillis() as UnixTimestamp,
		};
	}

	//
}
