'use client';

/* * */

import { Fieldset, NumberInput as MantineNumberInput } from '@mantine/core';
import { IconWorldLatitude, IconWorldLongitude } from '@tabler/icons-react';
import { type ClipboardEvent, useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export interface CoordinatesInputProps {

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
	defaultValue?: [number, number] | null

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
	onChange?: (coordinates: [number, number] | null) => void

	/**
	 * A placeholder for the input.
	 */
	placeholder?: string

	/**
	 * The value of the input.
	 * Use this field for controlled components.
	 * @default null
	 */
	value?: [number, number] | null

	/**
	 * Whether to show seconds in the time picker.
	 * @default false
	 */
	withSeconds?: boolean

}

/**
 * Coordinates input component.
 * @param props
 * @returns
 */
export function CoordinatesInput(props: CoordinatesInputProps) {
	//

	//
	// A. Setup variables

	const [latitudeValue, setLatitudeValue] = useState<number | string>();
	const [longitudeValue, setLongitudeValue] = useState<number | string>();

	//
	// B. Transform data

	useEffect(() => {
		// Combine value and defaultValue props
		const combinedValue = props.value ?? props.defaultValue;
		// If value is not provided, clear input fields
		if (combinedValue === undefined || combinedValue === null) {
			setLatitudeValue(undefined);
			setLongitudeValue(undefined);
			return;
		}
		// Transform lat/lon values
		setLatitudeValue(combinedValue[0]);
		setLongitudeValue(combinedValue[1]);
	}, [props.value, props.defaultValue]);

	useEffect(() => {
		// Skip if onChange is not provided
		if (!props.onChange) return;
		// If input values are null or undefined, call onChange with null
		if (latitudeValue === undefined || latitudeValue === null) return;
		if (longitudeValue === undefined || longitudeValue === null) return;
		// Try to transform the value into a valid coordinates array
		const coordinates: [number, number] = [Number(latitudeValue), Number(longitudeValue)];
		props.onChange(coordinates);
	}, [latitudeValue, longitudeValue]);

	//
	// C. Handle actions

	const handlePasteCoordinates = (event: ClipboardEvent<HTMLInputElement>) => {
		const pastedText = event.clipboardData.getData('text').trim();
		if (!pastedText) return;

		const matches = pastedText.match(/-?\d+(?:[.,]\d+)?/g);
		if (!matches || matches.length < 2) return;

		const firstValue = Number(matches[0].replace(',', '.'));
		const secondValue = Number(matches[1].replace(',', '.'));
		if (Number.isNaN(firstValue) || Number.isNaN(secondValue)) return;

		event.preventDefault();

		const isFirstLat = firstValue >= -90 && firstValue <= 90;
		const isSecondLat = secondValue >= -90 && secondValue <= 90;
		const isFirstLon = firstValue >= -180 && firstValue <= 180;
		const isSecondLon = secondValue >= -180 && secondValue <= 180;

		if (!isFirstLat && isFirstLon && isSecondLat && isSecondLon) {
			setLatitudeValue(secondValue);
			setLongitudeValue(firstValue);
			return;
		}

		setLatitudeValue(firstValue);
		setLongitudeValue(secondValue);
	};

	// const handlePaste = useCallback(
	// 	(event: React.ClipboardEvent<HTMLInputElement>) => {
	// 		event.preventDefault();
	// 		const pastedText = event.clipboardData.getData('text').trim();
	// 		if (!pastedText) return;

	// 		const pastedValues = pastedText
	// 			.split(/[, ]+/)
	// 			.map(val => val.trim())
	// 			.filter(val => val.length > 0);

	// 		onPaste?.(pastedValues);

	// 		if (pastedValues.length >= 2) {
	// 			const lat = Number(pastedValues[0]);
	// 			const lng = Number(pastedValues[1]);

	// 			if (!isNaN(lat) && !isNaN(lng)) {
	// 				const clampedLat = clamp(lat, -90, 90);
	// 				const clampedLng = clamp(lng, -180, 180);
	// 				updateCoordinates([clampedLat, clampedLng]);
	// 			}
	// 		}
	// 	},
	// 	[updateCoordinates, onPaste],
	// );

	// const handleBlur = useCallback(
	// 	(index: number) => {
	// 		const clampedValue = index === 0 ? clamp(coordinates[0], -90, 90) : clamp(coordinates[1], -180, 180);

	// 		if (coordinates[index] !== clampedValue) {
	// 			const newCoords: [number, number] = index === 0 ? [clampedValue, coordinates[1]] : [coordinates[0], clampedValue];
	// 			updateCoordinates(newCoords);
	// 		}
	// 	},
	// 	[coordinates, updateCoordinates],
	// );

	//
	// D. Render components

	return (
		<Fieldset className={styles.fieldset} variant="unstyled">
			<MantineNumberInput
				classNames={{ root: styles.latInput_root, wrapper: styles.latInput_wrapper }}
				description={props.description}
				disabled={props.disabled}
				label={props.label}
				leftSection={<IconWorldLatitude />}
				onChange={setLatitudeValue}
				onPaste={handlePasteCoordinates}
				placeholder="Latitude (-90 to 90)"
				step={0.000001}
				value={latitudeValue}
			/>
			<MantineNumberInput
				classNames={{ root: styles.lonInput_root, wrapper: styles.lonInput_wrapper }}
				description={props.description ? '.' : undefined}
				disabled={props.disabled}
				label={props.label ? ' ' : undefined}
				leftSection={<IconWorldLongitude />}
				onChange={setLongitudeValue}
				onPaste={handlePasteCoordinates}
				placeholder="Longitude (-180 to 180)"
				step={0.000001}
				style={{ flex: 1 }}
				value={longitudeValue}
			/>
		</Fieldset>
	);
}
