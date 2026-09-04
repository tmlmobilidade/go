'use client';

/* * */

import { DateInput as MantineDateInput, DateInputProps as MantineDateInputProps } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { type OperationalDateInt, OperationalDateIntSchema, toCalendarDate } from '@tmlmobilidade/go-types-shared';

/* * */

export interface DateInputProps extends Omit<MantineDateInputProps, 'defaultValue' | 'onChange' | 'size' | 'type' | 'value'> {

	/**
	 * Left section of the input.
	 * @default <IconCalendar size={20} />
	 */
	leftSection?: React.ReactNode

	/**
	 * The default value of the input.
	 * Use this field for uncontrolled components.
	 */
	defaultValue?: null | OperationalDateInt

	/**
	 * Callback fired when the date is changed.
	 * @param operationalDate The selected operational date
	 * or null if the date is invalid or cleared.
	 */
	onChange?: (operationalDate: null | OperationalDateInt) => void

	/**
	 * The value of the input.
	 * Use this field for controlled components.
	 */
	value?: null | OperationalDateInt

}

/* * */

function toMantineDate(value: null | OperationalDateInt | undefined): null | string | undefined {
	if (value === undefined) return undefined;
	if (value === null) return null;
	return toCalendarDate(value);
}

/* * */

export function DateInput({ leftSection = <IconCalendar size={20} />, defaultValue, value, onChange, ...props }: DateInputProps) {
	//

	//
	// A. Handle actions

	const handleChange = (mantineValue: string) => {
		// Skip if onChange is not provided
		if (!onChange) return;
		// If value is null or undefined,
		// call onChange with null
		if (!mantineValue || typeof mantineValue !== 'string') {
			onChange(null);
			return;
		}
		// Try to transform the value into a valid operational date
		// If it succeeds, call onChange with the validated date
		// If it fails, call onChange with null
		try {
			onChange(OperationalDateIntSchema.parse(mantineValue));
			return;
		}
		catch (error) {
			console.error('DateInput: Invalid date format', error);
			onChange(null);
			return;
		}
	};

	//
	// B. Render components

	return (
		<MantineDateInput
			leftSection={leftSection}
			{...props}
			{...(defaultValue !== undefined ? { defaultValue: toMantineDate(defaultValue) } : {})}
			{...(value !== undefined ? { value: toMantineDate(value) } : {})}
			onChange={handleChange}
			type="default"
		/>
	);

	//
}
