'use client';

/* * */

import { Fieldset, Input } from '@mantine/core';
import { DateInput as MantineDateInput, TimePicker as MantineTimePicker } from '@mantine/dates';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { Dates, TimezoneIdentified } from '@tmlmobilidade/dates';
import { type UnixTimestamp, validateUnixTimestamp } from '@tmlmobilidade/types';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export interface DateTimeInputProps {

	/**
	 * Whether the input can be cleared.
	 * @default false
	 */
	clearable?: boolean

	/**
	 * The default value of the input.
	 * Use this field for uncontrolled components.
	 * @default null
	 */
	defaultValue?: null | UnixTimestamp

	/**
	 * A brief description of the input.
	 */
	description?: string

	/**
	 * Whether the input is disabled.
	 * @default false
	 */
	disabled?: boolean

	/**
	 * An error message for the input.
	 */
	error?: string

	/**
	 * A label for the input.
	 */
	label?: string

	/**
	 * Callback fired when the date is changed.
	 * @param unixTimestamp The selected Unix timestamp
	 * or null if the date is invalid or cleared.
	 */
	onChange?: (unixTimestamp: null | UnixTimestamp) => void

	/**
	 * A placeholder for the input.
	 */
	placeholder?: string

	/**
	 * Whether the input is read-only.
	 * @default false
	 */
	readOnly?: boolean

	/**
	 * Timezone to use for the input.
	 * @default 'Europe/Lisbon'
	 */
	timezone?: TimezoneIdentified

	/**
	 * The value of the input.
	 * Use this field for controlled components.
	 * @default null
	 */
	value?: null | UnixTimestamp

	/**
	 * Whether to show seconds in the time picker.
	 * @default false
	 */
	withSeconds?: boolean

}

/* * */

export function DateTimeInput(props: DateTimeInputProps) {
	//

	//
	// A. Setup variables

	const [dateInputValue, setDateInputValue] = useState<string>();
	const [timePickerValue, setTimePickerValue] = useState<string>();
	const timezone = props.timezone ?? 'Europe/Lisbon';

	//
	// B. Transform data

	useEffect(() => {
		// Combine value and defaultValue props
		const combinedValue = props.value ?? props.defaultValue;
		// If value is not provided, clear input fields
		if (combinedValue === undefined || combinedValue === null) {
			setDateInputValue(undefined);
			setTimePickerValue(undefined);
			return;
		}
		// Try to validate the provided unix timestamp
		try {
			const validatedUnixTimestamp = validateUnixTimestamp(combinedValue);
			// Transform unix timestamp into date and time strings
			const dateString = Dates
				.fromUnixTimestamp(validatedUnixTimestamp)
				.setZone(timezone, 'offset_only')
				.toFormat('yyyy-MM-dd');
			setDateInputValue(dateString);
			// Transform unix timestamp into time string
			const timeString = Dates
				.fromUnixTimestamp(validatedUnixTimestamp)
				.setZone(timezone, 'offset_only')
				.toFormat('HH:mm:ss');
			setTimePickerValue(timeString);
		} catch (error) {
			console.error('DateInput: Invalid unix timestamp provided in value prop', error);
			setDateInputValue(undefined);
			setTimePickerValue(undefined);
		}
	}, [props.value, props.defaultValue]);

	useEffect(() => {
		// Skip if onChange is not provided
		if (!props.onChange) return;
		// If input values are null or undefined, call onChange with null
		if (!dateInputValue || typeof dateInputValue !== 'string') return;
		if (!timePickerValue || typeof timePickerValue !== 'string') return;
		// Try to transform the value into a valid unix timestamp
		// If it succeeds, call onChange with the validated timestamp
		// If it fails, call onChange with null
		try {
			const formattedTimeValue = timePickerValue.length === 5 ? `${timePickerValue}:00` : timePickerValue;
			const unixTimestamp = Dates
				.fromFormat(`${dateInputValue} ${formattedTimeValue}`, 'yyyy-MM-dd HH:mm:ss', timezone)
				.unix_timestamp;
			const validatedUnixTimestamp = validateUnixTimestamp(unixTimestamp);
			props.onChange(validatedUnixTimestamp);
			return;
		} catch (error) {
			console.log('DateTimeInput: Invalid date format', error);
			return;
		}
	}, [dateInputValue, timePickerValue, props.onChange, timezone, props.value]);

	//
	// C. Render components

	return (
		<Fieldset className={styles.fieldset} variant="unstyled">
			<MantineDateInput
				classNames={{ root: styles.dateInput_root, wrapper: styles.dateInput_wrapper }}
				clearable={props.clearable}
				description={props.description}
				disabled={props.disabled}
				error={props.error}
				label={props.label}
				leftSection={<IconCalendar size={20} />}
				onChange={setDateInputValue}
				placeholder={props.placeholder ?? 'Selecione uma data...'}
				readOnly={props.readOnly}
				type="default"
				value={dateInputValue}
			/>
			<MantineTimePicker
				classNames={{ dropdown: styles.timePicker_dropdown, root: styles.timePicker_root, wrapper: styles.timePicker_wrapper }}
				description={props.description ? ' ' : undefined}
				disabled={props.disabled}
				format="24h"
				label={props.label ? ' ' : undefined}
				leftSection={<IconClock size={20} />}
				onChange={setTimePickerValue}
				readOnly={props.readOnly}
				value={timePickerValue}
				withSeconds={props.withSeconds}
				presets={[
					{ label: 'Manhã', values: ['04:00:00', '09:00:00', '12:00:00'] },
					{ label: 'Tarde', values: ['14:00:00', '16:00:00', '18:00:00'] },
					{ label: 'Noite', values: ['20:00:00', '22:00:00', '23:59:59'] },
				]}
				rightSection={
					// Even though Mantine TimePicker has a clearable prop,
					// it is based on the CloseButton component and not on the
					// other Inputs ClearButton default component.
					// Therefore, we replace the TimePicker's rightSection
					// with the Input.ClearButton to ensure consistency across all inputs.
					props.clearable && timePickerValue !== ''
						? <Input.ClearButton onClick={() => setTimePickerValue('')} />
						: undefined
				}
				withDropdown
			/>
		</Fieldset>
	);

	//
}
