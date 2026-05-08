'use client';

import { TimePicker as MantineTimePicker } from '@mantine/dates';
import { IconClock, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { IconButton } from '../../buttons';

/* * */

export interface TimeInputProps {
	/**
	 * The default value of the input.
	 * Use this field for uncontrolled components.
	 */
	defaultValue?: string

	/**
	 * Whether to show a delete button.
	 * @default false
	 */
	deletable?: boolean

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
	 * Callback fired when the time is changed.
	 * @param value The time value as a string
	 */
	onChange?: (value: string) => void

	/**
	 * Callback fired when the delete button is clicked.
	 * Only called when deletable is true.
	 */
	onDelete?: () => void

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
	 * Whether the input is required.
	 * @default false
	 */
	required?: boolean

	/**
	 * The value of the input.
	 * Use this field for controlled components.
	 */
	value?: string

	/**
	 * Width of the input.
	 */
	w?: number | string

	/**
	 * Whether to show seconds.
	 * @default false
	 */
	withSeconds?: boolean
}

/* * */

export function TimeInput(props: TimeInputProps) {
	//

	const [dropdownOpened, setDropdownOpened] = useState(false);

	const handleChange = (value: string) => {
		props.onChange?.(value);
		if (value !== '') {
			setDropdownOpened(false);
		}
	};

	return (
		<MantineTimePicker
			defaultValue={props.defaultValue}
			description={props.description}
			disabled={props.disabled}
			error={props.error}
			format="24h"
			label={props.label}
			onChange={handleChange}
			readOnly={props.readOnly}
			value={props.value}
			w={props.w}
			withSeconds={props.withSeconds}
			leftSection={(
				<IconButton
					disabled={props.disabled}
					icon={<IconClock size={16} />}
					onClick={() => setDropdownOpened(true)}
				/>
			)}
			popoverProps={{
				onChange: _opened => !_opened && setDropdownOpened(false),
				opened: dropdownOpened,
			}}
			rightSection={
				props.deletable && props.onDelete ? (
					<IconButton
						color="red"
						disabled={props.disabled}
						icon={<IconTrash size={16} />}
						onClick={props.onDelete}
						variant="subtle"
					/>
				) : undefined
			}
			withDropdown
		/>
	);
}

//
