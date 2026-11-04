'use client';

import { Fieldset, Input } from '@mantine/core';
import { DateInput as MantineDateInput, TimePicker as MantineTimePicker } from '@mantine/dates';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { type TimezoneIdentified, type UnixMilliseconds, validateUnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
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
	defaultValue?: null | UnixMilliseconds

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
	 * @param unixMilliseconds The selected Unix timestamp
	 * or null if the date is invalid or cleared.
	 */
	onChange?: (unixMilliseconds: null | UnixMilliseconds) => void

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
	value?: null | UnixMilliseconds

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
	// B. Handle input changes

	const handleInputChange = (dateValue: null | string | undefined, timeValue: string | undefined) => {
		setDateInputValue(dateValue ?? undefined);
		setTimePickerValue(timeValue);

		if (!props.onChange) return;

		if (!dateValue || !timeValue) {
			props.onChange(null);
			return;
		}

		try {
			const formattedTimeValue = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
			const unixMilliseconds = Dates
				.fromFormat(`${dateValue} ${formattedTimeValue}`, 'yyyy-MM-dd HH:mm:ss', timezone)
				.unix_milliseconds;
			const validatedUnixMilliseconds = validateUnixMilliseconds(unixMilliseconds);
			props.onChange(validatedUnixMilliseconds);
		} catch (error) {
			console.log('DateTimeInput: Invalid date format', error);
		}
	};

	//
	// C. Transform data

	useEffect(() => {
		// Combine value and defaultValue props
		const combinedValue = props.value ?? props.defaultValue;
		// If value is not provided, clear input fields
		if (combinedValue === undefined || combinedValue === null) {
			setDateInputValue(undefined);
			setTimePickerValue(undefined);
			return;
		}
		// Try to validate the provided unix milliseconds
		try {
			const validatedUnixMilliseconds = validateUnixMilliseconds(combinedValue);
			// Transform unix milliseconds into date and time strings
			const dateString = Dates
				.fromUnixMilliseconds(validatedUnixMilliseconds)
				.setZone(timezone, 'offset_only')
				.toFormat('yyyy-MM-dd');
			setDateInputValue(dateString);
			// Transform unix milliseconds into time string
			const timeString = Dates
				.fromUnixMilliseconds(validatedUnixMilliseconds)
				.setZone(timezone, 'offset_only')
				.toFormat('HH:mm:ss');
			setTimePickerValue(timeString);
		} catch (error) {
			console.error('DateInput: Invalid unix milliseconds provided in value prop', error);
			setDateInputValue(undefined);
			setTimePickerValue(undefined);
		}
	}, [props.value, props.defaultValue, timezone]);

	//
	// D. Render components

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
				onChange={value => handleInputChange(value, timePickerValue)}
				placeholder={props.placeholder ?? 'Selecione uma data...'}
				popoverProps={{ withinPortal: false }}
				readOnly={props.readOnly}
				type="default"
				value={dateInputValue ?? null}
			/>
			<MantineTimePicker
				classNames={{ dropdown: styles.timePicker_dropdown, root: styles.timePicker_root, wrapper: styles.timePicker_wrapper }}
				description={props.description ? ' ' : undefined}
				disabled={props.disabled}
				format="24h"
				label={props.label ? ' ' : undefined}
				leftSection={<IconClock size={20} />}
				onChange={value => handleInputChange(dateInputValue, value)}
				popoverProps={{ withinPortal: false }}
				readOnly={props.readOnly}
				value={timePickerValue ?? ''}
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
						? <Input.ClearButton onClick={() => handleInputChange(dateInputValue, '')} />
						: undefined
				}
				withDropdown
			/>
		</Fieldset>
	);

	//
}
