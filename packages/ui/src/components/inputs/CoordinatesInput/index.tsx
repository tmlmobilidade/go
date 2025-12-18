'use client';

/* * */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Description } from '../../common';
import { Label } from '../../display';
import { Section } from '../../layout/Section';
import { NumberInput } from '../NumberInput';

/* * */

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

/* * */

interface CoordinatesInputProps {
	description?: string
	disabled?: boolean
	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key?: string
	label?: string
	onChange?: (changed: [number, number]) => void
	onPaste?: (pastedValues: string[]) => void
	value?: [number, number]
}

export function CoordinatesInput({ description, disabled = false, label = 'Coordenadas', onChange, onPaste, value }: CoordinatesInputProps) {
	//

	//
	// A. Setup variables

	const [coordinates, setCoordinates] = useState<[number, number]>(value ?? [0, 0]);
	const { t } = useTranslation('global', { keyPrefix: 'components.coordinates_input' });

	//
	// B. Setup functions

	useEffect(() => {
		if (value && (value[0] !== coordinates[0] || value[1] !== coordinates[1])) {
			setCoordinates(value);
		}
	}, [value]);

	const updateCoordinates = useCallback((newCoords: [number, number]) => {
		setCoordinates(newCoords);
		onChange?.(newCoords);
	}, [onChange]);

	//
	// C. Handle actions

	const handlePaste = useCallback(
		(event: React.ClipboardEvent<HTMLInputElement>) => {
			event.preventDefault();
			const pastedText = event.clipboardData.getData('text').trim();
			if (!pastedText) return;

			const pastedValues = pastedText
				.split(/[, ]+/)
				.map(val => val.trim())
				.filter(val => val.length > 0);

			onPaste?.(pastedValues);

			if (pastedValues.length >= 2) {
				const lat = Number(pastedValues[0]);
				const lng = Number(pastedValues[1]);

				if (!isNaN(lat) && !isNaN(lng)) {
					const clampedLat = clamp(lat, -90, 90);
					const clampedLng = clamp(lng, -180, 180);
					updateCoordinates([clampedLat, clampedLng]);
				}
			}
		},
		[updateCoordinates, onPaste],
	);

	const handleBlur = useCallback(
		(index: number) => {
			const clampedValue = index === 0 ? clamp(coordinates[0], -90, 90) : clamp(coordinates[1], -180, 180);

			if (coordinates[index] !== clampedValue) {
				const newCoords: [number, number] = index === 0 ? [clampedValue, coordinates[1]] : [coordinates[0], clampedValue];
				updateCoordinates(newCoords);
			}
		},
		[coordinates, updateCoordinates],
	);

	//
	// D. Render components

	return (
		<Section flexDirection="column" gap="xs" padding="none">
			<Label>{label}</Label>
			{description && <Description>{description}</Description>}
			<Section flexDirection="row" gap="sm" padding="none">
				<NumberInput
					key="lat"
					disabled={disabled}
					onBlur={() => handleBlur(0)}
					onPaste={handlePaste}
					placeholder={t('latitude_placeholder')}
					step={0.000001}
					style={{ flex: 1 }}
					value={coordinates[0] === 0 && coordinates[1] === 0 ? '' : coordinates[0]}
					onChange={(val) => {
						const newLat = Number(val);
						if (!isNaN(newLat)) {
							updateCoordinates([newLat, coordinates[1]]);
						}
					}}
				/>

				<NumberInput
					key="lon"
					disabled={disabled}
					onBlur={() => handleBlur(1)}
					onPaste={handlePaste}
					placeholder={t('longitude_placeholder')}
					step={0.000001}
					style={{ flex: 1 }}
					value={coordinates[0] === 0 && coordinates[1] === 0 ? '' : coordinates[1]}
					onChange={(val) => {
						const newLng = Number(val);
						if (!isNaN(newLng)) {
							updateCoordinates([coordinates[0], newLng]);
						}
					}}
				/>
			</Section>
		</Section>
	);
}
