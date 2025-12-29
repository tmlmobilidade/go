'use client';

/* * */

import { useVehicleCreateContext } from '@/components/Vehicles/create/VehicleCreate.context';
import { Calendar } from '@mantine/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import dayjs from 'dayjs';

/* * */

export function DatesSelector() {
	//

	//
	// A. Setup variables

	const vehicleCreateContext = useVehicleCreateContext();

	//
	// B. Handle actions

	const handleSelect = (date: Date) => {
		const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
		const currentDates = vehicleCreateContext.data.form.values.registration_date || [];
		const isSelected = currentDates.includes(operationalDate);

		if (isSelected) {
			// Remove date from vehicle
			vehicleCreateContext.data.form.setFieldValue(
				'dates',
				currentDates.filter(d => d !== operationalDate),
			);
		}
		else {
			// Add date to vehicle
			vehicleCreateContext.data.form.setFieldValue(
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
				onClick: () => handleSelect(new Date(date)),
				selected: (vehicleCreateContext.data.form.values.registration_date || []).includes(dayjs(date).format('YYYYMMDD') as OperationalDate),
			})}
		/>
	);

	//
}
