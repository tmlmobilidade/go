'use client';

import { DateInput as MantineDateInput, DateInputProps as MantineDateInputProps } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { type OperationalDate, validateOperationalDate } from '@tmlmobilidade/types';

/* * */

export interface DateInputProps extends Omit<MantineDateInputProps, 'size' | 'type'> {

	/**
	 * Left section of the input.
	 * @default <IconCalendar size={20} />
	 */
	leftSection?: React.ReactNode

	/**
	 * Callback fired when the date is changed.
	 * @param operationalDate The selected operational date
	 * or null if the date is invalid or cleared.
	 */
	onChange?: (operationalDate: null | OperationalDate) => void

}

/* * */

export function DateInput({ leftSection = <IconCalendar size={20} />, ...props }: DateInputProps) {
	//

	//
	// A. Handle actions

	const handleChange = (value: string) => {
		// Skip if onChange is not provided
		if (!props.onChange) return;
		// If value is null or undefined,
		// call onChange with null
		if (!value || typeof value !== 'string') {
			props.onChange(null);
			return;
		}
		// Try to transform the value into a valid operational date
		// If it succeeds, call onChange with the validated date
		// If it fails, call onChange with null
		try {
			const formatttedValue = value.replaceAll('-', '');
			const validatedOperationalDate = validateOperationalDate(formatttedValue);
			console.log('DateInput: Valid date selected', validatedOperationalDate);
			props.onChange(validatedOperationalDate);
			return;
		}
		catch (error) {
			console.error('DateInput: Invalid date format', error);
			props.onChange(null);
			return;
		}
	};

	//
	// B. Render components

	return (
		<MantineDateInput
			leftSection={leftSection}
			{...props}
			onChange={handleChange}
			type="default"
		/>
	);

	//
}
