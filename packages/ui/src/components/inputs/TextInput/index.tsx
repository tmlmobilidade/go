'use client';

import { Center, TextInput as MantineTextInput, TextInputProps as MantineTextInputProps, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

/* * */

export interface TextInputProps extends MantineTextInputProps {
	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string
	tooltip?: string
	validation?: RegExp
}

/* * */

export function TextInput({ error, validation, value, ...props }: TextInputProps) {
	//

	//
	// A. Setup variables

	const [isValid, setIsValid] = useState(true);

	//
	// B.Transform data

	useEffect(() => {
		if (!value || !error || !validation || value.toString().length === 0) {
			setIsValid(true);
		}
		else {
			const isValid = validation.test(value.toString());
			setIsValid(isValid);
		}
	}, [value]);

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

	return (
		<MantineTextInput
			error={error ? error : isValid ? '' : error}
			rightSection={props.tooltip && renderTooltip(props.tooltip)}
			value={value}
			{...props}
		/>
	);

	//
}
