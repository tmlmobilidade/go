'use client';

/* * */

import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { Calendar } from '@mantine/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import dayjs from 'dayjs';

/* * */

export function DatesSelector() {
	//

	//
	// A. Setup variables

	const vehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Handle actions

	const handleSelect = (date: Date) => {
		const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
		const currentDates = vehiclesDetailContext.data.form.values.registration_date || [];
		const isSelected = currentDates.includes(operationalDate);

		if (isSelected) {
			// Remove date from vehicle
			vehiclesDetailContext.data.form.setFieldValue(
				'dates',
				currentDates.filter(d => d !== operationalDate),
			);
		}
		else {
			// Add date to vehicle
			vehiclesDetailContext.data.form.setFieldValue(
				'dates',
				[...currentDates, operationalDate],
			);
		}
	};

	//
	// C. Render components

	return (
		<Calendar
			getDayProps={date => ({
				disabled: vehiclesDetailContext.flags.read_only,
				onClick: () => handleSelect(new Date(date)),
				selected: (vehiclesDetailContext.data.form.values.registration_date || []).includes(dayjs(date).format('YYYYMMDD') as OperationalDate),
			})}
		/>
	);

	//
}
