'use client';

/* * */

import { NumberInput } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

interface CoordinatesInputProps {
	disabled?: boolean
	label1?: string
	label2?: string
	onChange?: (selected: string[]) => void
	onPaste?: (pastedValues: string[]) => void
	setValue?: (coordinate: [number, number]) => void
	value?: [number, number]
}

/* * */

export default function CoordinatesInput({
	disabled,
	label1,
	label2,
	onChange,
	onPaste,
	setValue,
	value,
}: CoordinatesInputProps) {
	//

	//
	// A. setup variables
	const [coordinates, setCoordinates] = useState<[number, number] | undefined>();

	//
	// B. handle action

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();

		const pastedText = event.clipboardData.getData('text');
		if (!pastedText.trim()) return;

		// Split by common delimiters: comma, semicolon, newline, tab
		const pastedValues = pastedText
			.split(/[,;\n\t]+/)
			.map(val => val.trim())
			.filter(val => val.length > 0);

		// Call custom onPaste handler if provided
		onPaste?.(pastedValues);

		//
		setCoordinates([Number(pastedValues[0]), Number(pastedValues[1])]);
	};

	return (
		<>
			<NumberInput
				disabled={disabled}
				label={label1}
				onPaste={handlePaste}
				style={{ width: '100%' }}
				value={coordinates && coordinates[0]}
			/>
			<NumberInput
				disabled={disabled}
				label={label2}
				onPaste={handlePaste}
				style={{ width: '100%' }}
				value={coordinates && coordinates[1]}
			/>
		</>
	);
}
