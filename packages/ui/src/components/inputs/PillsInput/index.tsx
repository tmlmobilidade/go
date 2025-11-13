'use client';

/* * */

import { Center, PillsInput as MantinePillsInput, type PillsInputProps as MantinePillsInputProps, Pill, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export interface PillsInputProps extends Omit<MantinePillsInputProps, 'onChange'> {
	onChange?: (values: string[]) => void
	tooltip?: string
	validate?: {
		message: string
		validator: (value: string) => boolean
	}
	values: string[]
}

/* * */

export function PillsInput({ onChange, validate, values, ...props }: PillsInputProps) {
	//

	//
	// A. Setup variables

	const [inputValue, setInputValue] = useState('');
	const [_values, setValues] = useState(values ?? []);
	const [isValid, setIsValid] = useState(true);

	//
	// B. Handle Actions

	useEffect(() => {
		onChange?.(_values);
	}, [_values]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// if (e.key === 'Backspace' && inputValue.length === 0) {
		// 	setValues(_values.slice(0, -1));
		// }

		if (e.key === 'Enter' && inputValue.length > 0) {
			// Check for duplicates
			if (_values.includes(inputValue)) {
				setInputValue('');
				return;
			}

			const isValid = validate?.validator(inputValue) ?? true;

			if (!isValid) {
				setIsValid(false);
				return;
			}

			setValues([..._values, inputValue]);
			setInputValue('');
			setIsValid(true);
		}
	};

	//
	// C. Render components

	const renderTooltip = (tooltip?: string) => (
		<Tooltip
			label={tooltip}
			position="top-end"
			transitionProps={{ transition: 'pop-bottom-right' }}
			withArrow
		>
			<Center style={{ cursor: 'help' }}>
				<IconInfoCircle size={20} />
			</Center>
		</Tooltip>
	);

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		if (inputValue.length > 0) return;

		event.preventDefault();

		const pastedText = event.clipboardData.getData('text');
		if (!pastedText.trim()) return;

		// Split by common delimiters: comma, semicolon, newline, tab
		const pastedValues = pastedText
			.split(/[,;\n\t]+/)
			.map(val => val.trim())
			.filter(val => val.length > 0);

		// Add matching items to selection
		if (pastedValues.length > 0) {
			const newValidValues = pastedValues.filter((value) => {
				if (_values.includes(value)) return false;
				const isValid = validate?.validator(value) ?? true;
				return isValid;
			});

			if (newValidValues.length > 0) {
				setValues([..._values, ...newValidValues]);
			}
		}

		// Clear search after paste
		setInputValue('');
	};

	const handleValueRemove = (itemToRemove: string) => {
		const newValue = _values.filter(item => item !== itemToRemove);
		setValues(newValue);
	};

	const renderValues = _values.map(item => (
		<Pill key={item} className={styles.pill} onRemove={() => handleValueRemove(item)} withRemoveButton>
			{item}
		</Pill>
	));

	return (
		<MantinePillsInput
			error={isValid ? '' : validate?.message}
			rightSection={props.tooltip && renderTooltip(props.tooltip)}
			{...props}
		>
			<Pill.Group className={styles.pillsInputPillGroup}>
				{renderValues}
			</Pill.Group>
			<MantinePillsInput.Field
				onChange={e => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				onPaste={handlePaste}
				value={inputValue}
				classNames={{
					field: styles.pillsInputField,
				}}
			/>
		</MantinePillsInput>
	);
}
