'use client';

import { NumberInput } from '@tmlmobilidade/ui';
import React, { useEffect, useState } from 'react';

interface CoordinatesInputProps {
	disabled?: boolean
	label1?: string
	label2?: string
	onChange?: (changed: [number, number]) => void
	onPaste?: (pastedValues: string[]) => void
	value?: [number, number]
}

export default function CoordinatesInput({
	disabled,
	label1 = 'Latitude',
	label2 = 'Longitude',
	onChange,
	onPaste,
	value,
}: CoordinatesInputProps) {
	//

	//
	// A. setup variables

	const [coordinates, setCoordinates] = useState<[number, number]>(value ?? [0, 0]);

	//
	// B. fetch data

	useEffect(() => {
		if (value && (value[0] !== coordinates[0] || value[1] !== coordinates[1])) {
			setCoordinates(value);
		}
	}, [value]);

	//

	const updateCoordinates = (newCoordinates: [number, number]) => {
		setCoordinates(newCoordinates);
		console.log('coordinates', coordinates, '| value', value);
	};

	//

	// Handle paste
	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();

		const pastedText = event.clipboardData.getData('text');
		if (!pastedText.trim()) return;

		const pastedValues = pastedText
			.split(/[,]+/)
			.map(val => val.trim())
			.filter(val => val.length > 0);

		onPaste?.(pastedValues);

		if (pastedValues.length >= 2) {
			const newCoords: [number, number] = [
				Number(pastedValues[0]),
				Number(pastedValues[1]),
			];
			updateCoordinates(newCoords);
		}
	};

	return (
		<>
			<NumberInput
				disabled={disabled}
				label={label1}
				onPaste={handlePaste}
				style={{ width: '100%' }}
				value={coordinates[0]}
				onChange={(value) => {
					const newCoords: [number, number] = [Number(value), coordinates[1]];
					updateCoordinates(newCoords);
					onChange?.(coordinates);
				}}
			/>

			<NumberInput
				disabled={disabled}
				label={label2}
				onPaste={handlePaste}
				style={{ width: '100%' }}
				value={coordinates[1]}
				onChange={(value) => {
					const newCoords: [number, number] = [coordinates[0], Number(value)];
					updateCoordinates(newCoords);
					onChange?.(coordinates);
				}}
			/>
		</>
	);
}
