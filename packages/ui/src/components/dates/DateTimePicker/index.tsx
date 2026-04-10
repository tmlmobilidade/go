'use client';

/* * */

import { DateTimePicker as MantineDateTimePicker } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export interface DateTimePickerProps {

	/**
	 * Whether the input is clearable.
	 * @default false
	 */
	clearable?: boolean

	/**
	 * Description of the input.
	 */
	description?: string

	/**
	 * The current edit status of the input.
	 */
	disabled?: boolean

	/**
	 * Full width of the input.
	 */
	fullWidth?: boolean

	/**
	 * Label of the input.
	 */
	label?: string

	/**
	 * Left section of the input.
	 * @default <IconCalendar size={20} />
	 */
	leftSection?: React.ReactNode

	/**
	 * Called when the value changes.
	 * @param value The new value.
	 */
	onChange?: (value: null | UnixTimestamp) => void

	/**
	 * Placeholder text for the input.
	 */
	placeholder?: string

	/**
	 * The current value of the input.
	 */
	value?: null | UnixTimestamp
}

/**
 * This component is used to select a date and time.
 * @deprecated Use DateTimeInput instead.
 */
export function DateTimePicker({ clearable, description, disabled, fullWidth, label, leftSection = <IconCalendar size={20} />, onChange, placeholder, value }: DateTimePickerProps) {
	//

	//
	// A. Transform data

	const valueAsString = useMemo(() => {
		if (!value) return null;
		return Dates
			.fromUnixTimestamp(value)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('yyyy-LL-dd HH:mm:ss');
	}, [value]);

	//
	// B. Handle actions

	const handleChange = (value: null | string) => {
		if (!onChange) return;
		if (!value) return onChange(null);
		const parsedValue = Dates
			.fromFormat(value, 'yyyy-LL-dd HH:mm:ss', 'Europe/Lisbon')
			.unix_timestamp;
		onChange(parsedValue);
	};

	//
	// C. Render components

	return (
		<MantineDateTimePicker
			classNames={styles}
			clearable={clearable}
			description={description}
			disabled={disabled}
			label={label}
			leftSection={leftSection}
			onChange={handleChange}
			placeholder={placeholder}
			popoverProps={{ withinPortal: false }}
			rightSectionPointerEvents={clearable ? 'all' : undefined}
			style={{ width: fullWidth ? '100%' : undefined }}
			value={valueAsString}
			valueFormat="YYYY-MM-DD HH:mm"
		/>
	);
}
