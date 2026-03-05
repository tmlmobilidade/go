/* * */

/**
 * Pads a number with leading zeros to ensure it has at least 2 digits
 * @param num - The number to pad
 * @returns The padded string
 */
export function padZero(num: number): string {
	return num.toString().padStart(2, '0');
}

/**
 * Increments a GTFS time string (HH:MM:SS) by a given number of seconds
 * @param timeString - The time string in format HH:MM:SS or HH:MM
 * @param increment - Number of seconds to add
 * @returns The new time string in format HH:MM:SS
 */
export function incrementTime(timeString: string, increment: number): string {
	try {
		// Parse the time string into hours, minutes, and seconds
		const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);

		// Calculate the new total seconds
		const totalSeconds = hours * 3600 + minutes * 60 + seconds + increment;

		// Calculate the new hours, minutes, and seconds
		const newHours = Math.floor(totalSeconds / 3600);
		const newMinutes = Math.floor((totalSeconds % 3600) / 60);
		const newSeconds = Math.floor((totalSeconds % 3600) % 60);

		// Format the new time string
		return `${padZero(newHours)}:${padZero(newMinutes)}:${padZero(newSeconds)}`;
	}
	catch (error) {
		throw new Error(`Error at incrementTime(${timeString}, ${increment}): ${error}`);
	}
}

/**
 * Gets the current date and time in YYYYMMDDHHMM format
 * @returns The formatted date string
 */
export function getCurrentTimestamp(): string {
	const currentDate = new Date();
	const year = currentDate.getFullYear();
	const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
	const day = currentDate.getDate().toString().padStart(2, '0');
	const hours = currentDate.getHours().toString().padStart(2, '0');
	const minutes = currentDate.getMinutes().toString().padStart(2, '0');

	return year + month + day + hours + minutes;
}

/**
 * Maps a typology code to a line type number
 * @param typologyCode - The typology code
 * @returns The corresponding line type number
 */
export function getLineType(typologyCode: string): number {
	switch (typologyCode) {
		case 'INTER-REG':
			return 4;
		case 'LONGA':
			return 2;
		case 'MAR':
			return 5;
		case 'PROXIMA':
			return 1;
		case 'RAPIDA':
			return 3;
		default:
			return 0;
	}
}

/**
 * Calculates the day type for a given date
 * @param date - The date in YYYYMMDD format
 * @param isHoliday - Whether the date is a holiday
 * @returns The day type number (1-7)
 */
export function calculateDateDayType(date: string, isHoliday: boolean): number {
	// Convert YYYYMMDD to Date object
	const year = Number.parseInt(date.substring(0, 4), 10);
	const month = Number.parseInt(date.substring(4, 6), 10) - 1;
	const day = Number.parseInt(date.substring(6, 8), 10);
	const dateObj = new Date(year, month, day);

	// Get day of week (0 = Sunday, 6 = Saturday)
	const dayOfWeek = dateObj.getDay();

	// If it's a holiday, return 7
	if (isHoliday) return 7;

	// If it's Sunday, return 1
	if (dayOfWeek === 0) return 1;

	// If it's Saturday, return 6
	if (dayOfWeek === 6) return 6;

	// Otherwise, return the day of week + 1 (Monday = 2, ..., Friday = 6)
	return dayOfWeek + 1;
}
