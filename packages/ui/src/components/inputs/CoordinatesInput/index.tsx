'use client';

/* * */

import { useCallback, useEffect, useState } from 'react';

import { Description } from '../../common';
import { Label } from '../../display';
import { Section } from '../../layout/Section';
import { NumberInput } from '../NumberInput';

/* * */

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

/* * */

interface CoordinatesInputProps {
	defaultValue?: [number, number]
	description?: string
	disabled?: boolean
	/**
	 * The `key` prop is required to ensure correct re-mounting behavior.
	 * Use the `form.key('fieldName')` method to generate a unique key based on the form state.
	 */
	key: string
	label?: string
	onChange?: (changed: [number, number]) => void
	onPaste?: (pastedValues: string[]) => void
	value?: [number, number]
}

/**
 * CoordinatesInput is a composite input component for latitude and longitude coordinates.
 *
 * - Accepts both controlled (`value`) and uncontrolled (`defaultValue`) usage.
 * - Supports validation and clamping: latitude is restricted to -90..90, longitude to -180..180.
 * - Handles paste events for quickly populating fields from clipboard (CSV or space-separated).
 *
 * Props:
 *   - defaultValue?: [number, number] — Initial value if uncontrolled.
 *   - description?: string — Optional field description.
 *   - disabled?: boolean — Disables both input fields.
 *   - key: string — Unique key (required for correct re-mounting in forms).
 *   - label?: string — Field label (defaults to "Coordenadas").
 *   - onChange?: (changed: [number, number]) => void — Called when coordinates are changed.
 *   - onPaste?: (pastedValues: string[]) => void — Called when user pastes data.
 *   - value?: [number, number] — Controlled value.
 *
 * Usage:
 *   <CoordinatesInput
 *     label="Coordenadas"
 *     value={[38.7, -9.2]}
 *     onChange={handleCoords}
 *   />
 */
export function CoordinatesInput({
	defaultValue,
	description,
	disabled = false,
	label = 'Coordenadas',
	onChange,
	onPaste,
	value,
}: CoordinatesInputProps) {
	//
	// A. Setup variables

	/**
	 * Store current Latitude and Longitude tuple.
	 * Priority: controlled `value` > uncontrolled `defaultValue` > fallback [0, 0].
	 */
	const [coordinates, setCoordinates] = useState<[number, number]>(defaultValue ?? value ?? [0, 0]);

	//
	// B. Setup effects & callbacks

	/**
	 * Keeps state in sync with external (controlled) `value` prop.
	 */
	useEffect(() => {
		if (value && (value[0] !== coordinates[0] || value[1] !== coordinates[1])) {
			setCoordinates(value);
		}
	}, [coordinates, value]);

	/**
	 * Helper to update coordinates and propagate via onChange.
	 */
	const updateCoordinates = useCallback((newCoords: [number, number]) => {
		setCoordinates(newCoords);
		onChange?.(newCoords);
	}, [onChange]);

	//
	// C. Handle paste and blur actions

	/**
	 * Paste handler: supports format "lat,lng" or "lat lng", with optional whitespace,
	 * clamps and updates both values if valid. Optionally calls `onPaste`.
	 */
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

	/**
	 * Called on blur (focus out) of either input field; clamps entered value into valid range.
	 * @param index 0 for Latitude, 1 for Longitude
	 */
	const handleBlur = useCallback(
		(index: number) => {
			const clampedValue = index === 0 ? clamp(coordinates[0], -90, 90) : clamp(coordinates[1], -180, 180);

			if (coordinates[index] !== clampedValue) {
				const newCoords: [number, number] =
					index === 0 ? [clampedValue, coordinates[1]] : [coordinates[0], clampedValue];
				updateCoordinates(newCoords);
			}
		},
		[coordinates, updateCoordinates],
	);

	//
	// D. Render UI

	return (
		<Section flexDirection="column" gap="xs" padding="none">
			<Label>{label}</Label>
			{description && <Description>{description}</Description>}
			<Section flexDirection="row" gap="sm" padding="none">
				{/* Latitude input */}
				<NumberInput
					key="lat"
					disabled={disabled}
					onBlur={() => handleBlur(0)}
					onPaste={handlePaste}
					placeholder="Latitude (-90 to 90)"
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
				{/* Longitude input */}
				<NumberInput
					key="lon"
					disabled={disabled}
					onBlur={() => handleBlur(1)}
					onPaste={handlePaste}
					placeholder="Longitude (-180 to 180)"
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
