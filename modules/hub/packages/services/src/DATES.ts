/* * */

import { DateTime } from 'luxon';

/* * */

export default {
	compensate24HourRegularStringInto24HourPlusOperationTimeString: (regularTimeString: null | string | undefined): null | string => {
		if (!regularTimeString) return null;

		const [hoursOperation, minutesOperation, secondsOperation] = regularTimeString.split(':').map(Number);

		if (hoursOperation >= 0 && hoursOperation < 4) {
			const compensatedHoursOperation = hoursOperation + 24;
			return `${String(compensatedHoursOperation).padStart(2, '0')}:${String(minutesOperation).padStart(2, '0')}:${String(secondsOperation).padStart(2, '0')}`;
		}

		return `${String(hoursOperation).padStart(2, '0')}:${String(minutesOperation).padStart(2, '0')}:${String(secondsOperation).padStart(2, '0')}`;
	},

	convert24HourPlusOperationTimeStringToUnixTimestamp: (operationTimeString: null | string | undefined): null | number => {
		if (!operationTimeString) return null;

		const [hoursOperation, minutesOperation, secondsOperation] = operationTimeString.split(':').map(Number);
		const daysInTheHourComponent = Math.floor(hoursOperation / 24);
		const hoursLeftAfterDayConversion = hoursOperation % 24;

		let theDateTimeObject = DateTime.now().setZone('Europe/Lisbon');

		if (theDateTimeObject.hour >= 0 && theDateTimeObject.hour < 4) {
			theDateTimeObject = theDateTimeObject.minus({ days: 1 });
		}

		theDateTimeObject = theDateTimeObject.set({
			hour: hoursLeftAfterDayConversion,
			millisecond: 0,
			minute: minutesOperation,
			second: secondsOperation,
		});

		if (daysInTheHourComponent > 0) {
			theDateTimeObject = theDateTimeObject.plus({ days: daysInTheHourComponent });
		}

		return theDateTimeObject.toUTC().toUnixInteger();
	},
};
