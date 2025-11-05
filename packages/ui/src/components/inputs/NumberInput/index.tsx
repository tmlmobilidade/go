'use client';

/* * */

import { Center, NumberInput as MantineNumberInput, NumberInputProps as MantineNumberInputProps, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

/* * */

export interface NumberInputProps extends MantineNumberInputProps {
	hideControls?: boolean
	tooltip?: string
	validation?: RegExp
}

/* * */

export function NumberInput({ error, hideControls = true, validation, value, ...props }: NumberInputProps) {
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
		<MantineNumberInput
			error={error ? error : isValid ? '' : error}
			hideControls={hideControls}
			rightSection={props.tooltip && renderTooltip(props.tooltip)}
			value={value}
			{...props}
		/>
	);

	//
}
