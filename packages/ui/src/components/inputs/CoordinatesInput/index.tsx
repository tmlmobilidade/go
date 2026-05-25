'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Description } from '../../common';
import { Label } from '../../display';
import { Section } from '../../layout/Section';
import { NumberInput } from '../NumberInput';

/* * */

const COORDINATE_DECIMALS = 6;
const STEP = 10 ** -COORDINATE_DECIMALS;
const roundCoordinate = (value: number) => parseFloat(value.toFixed(COORDINATE_DECIMALS));

/* * */

type CoordinatesTuple = [number | undefined, number | undefined];

/* * */

const buildCoordsAtIndex = (
	prev: CoordinatesTuple,
	index: 0 | 1,
	valueAtIndex: number | undefined,
): CoordinatesTuple => (index === 0 ? [valueAtIndex, prev[1]] : [prev[0], valueAtIndex]);

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
	onChange?: (changed: CoordinatesTuple | undefined) => void
	onPaste?: (pastedValues: string[]) => void
	value?: CoordinatesTuple | undefined
}

/**
 * CoordinatesInput is a composite input component for latitude and longitude coordinates.
 *
 * - Accepts both controlled (`value`) and uncontrolled (`defaultValue`) usage.
 * - Supports validation and clamping: latitude is restricted to -90..90, longitude to -180..180.
 * - Handles typed or pasted coordinate pairs separated by comma or tab.
 *
 * Props:
 *   - defaultValue?: [number, number] — Initial value if uncontrolled.
 *   - description?: string — Optional field description.
 *   - disabled?: boolean — Disables both input fields.
 *   - key: string — Unique key (required for correct re-mounting in forms).
 *   - label?: string — Field label (defaults to "Coordenadas").
 *   - onChange?: (changed: [number | undefined, number | undefined] | undefined) => void — Called when coordinates change; `undefined` only when both are cleared.
 *   - onPaste?: (pastedValues: string[]) => void — Called when user pastes data.
 *   - value?: [number | undefined, number | undefined] — Controlled value.
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

	//
	// A. Setup variables

	/**
	 * Store current Latitude and Longitude tuple.
	 * Priority: controlled `value` > uncontrolled `defaultValue` > fallback [undefined, undefined].
	 */
	const [coordinates, setCoordinates] = useState<CoordinatesTuple>(value ?? defaultValue ?? [undefined, undefined]);
	const [focusedIndex, setFocusedIndex] = useState<0 | 1 | null>(null);
	const coordinatesRef = useRef(coordinates);
	coordinatesRef.current = coordinates;
	const onChangeDelayRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	//

	//
	// B. Setup effects & callbacks

	/**
	 * Keeps state in sync with external (controlled) `value` prop.
	 */
	useEffect(() => {
		if (value !== undefined) {
			const nextLat = value[0] === undefined ? undefined : roundCoordinate(value[0]);
			const nextLng = value[1] === undefined ? undefined : roundCoordinate(value[1]);
			setCoordinates((prev: CoordinatesTuple) => {
				if (prev[0] === nextLat && prev[1] === nextLng) return prev;
				return [nextLat, nextLng];
			});
		}
	}, [value]);

	useEffect(() => {
		return () => {
			const timeoutId = onChangeDelayRef.current;
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, []);

	/**
	 * Parses a coordinate pair string in the following formats:
	 * - `lat, lng`
	 * - `lat lng` (with a space or a tab)
	 * @param input The coordinate pair string to parse.
	 * @returns The parsed coordinates as an array of two numbers, or null if the input is invalid.
	 */
	const parseCoordinatePair = useCallback((input: string): [number, number] | null => {
		const values = input
			.trim()
			.split(/[,\t\s]+/)
			.map(val => val.trim())
			.filter(Boolean);
		if (values.length < 2) return null;
		const lat = Number(values[0]);
		const lng = Number(values[1]);

		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

		return [roundCoordinate(lat), roundCoordinate(lng)];
	}, []);

	/**
	 * Parses a single coordinate input value.
	 * @param raw The coordinate input string to parse.
	 * @returns Parsed value or undefined when the value is empty/invalid.
	 */
	const parseCoordinateInput = useCallback((raw: null | number | string | undefined): number | undefined => {
		if (raw === '' || raw === undefined || raw === null) {
			return undefined;
		}
		const parsed = typeof raw === 'number' ? raw : Number(raw);
		if (!Number.isFinite(parsed)) return undefined;
		return parsed;
	}, []);

	const notifyChange = useCallback((newCoords: CoordinatesTuple) => {
		if (newCoords[0] === undefined && newCoords[1] === undefined) {
			onChange?.(undefined);
			return;
		}
		onChange?.(newCoords);
	}, [onChange]);

	const applyCoordinates = useCallback((nextCoords: CoordinatesTuple) => {
		setCoordinates(nextCoords);
		notifyChange(nextCoords);
	}, [notifyChange]);

	const commitCoordinates = useCallback((newCoords: CoordinatesTuple) => {
		applyCoordinates(newCoords);
	}, [applyCoordinates]);

	const getDecimalInputProps = useCallback((index: 0 | 1) => {
		if (focusedIndex === index) return {};

		return {
			decimalScale: COORDINATE_DECIMALS,
			fixedDecimalScale: true as const,
		};
	}, [focusedIndex]);

	const handleFocus = useCallback((index: 0 | 1) => {
		setFocusedIndex(index);
	}, []);

	const commitCoordinateAtIndex = useCallback((index: 0 | 1, valueAtIndex: number | undefined) => {
		applyCoordinates(buildCoordsAtIndex(coordinatesRef.current, index, valueAtIndex));
	}, [applyCoordinates]);

	//

	//
	// C. Handle paste and blur actions

	/**
	 * Paste handler: supports format "lat,lng" or "lat\tlng", with optional whitespace,
	 * clamps and updates both values if valid. Optionally calls `onPaste`.
	 */
	const handlePaste = useCallback(
		(index: 0 | 1, event: React.ClipboardEvent<HTMLInputElement>) => {
			const pastedText = event.clipboardData.getData('text').trim();
			if (!pastedText) return;

			const pastedValues = pastedText
				.split(/[,\t\s]+/)
				.map(val => val.trim())
				.filter(Boolean);

			onPaste?.(pastedValues);

			const pair = parseCoordinatePair(pastedText);
			if (pair) {
				event.preventDefault();
				commitCoordinates(pair);
				return;
			}

			const numericValue = Number(pastedText);
			if (!Number.isFinite(numericValue)) return;

			event.preventDefault();
			commitCoordinateAtIndex(index, roundCoordinate(numericValue));
		},
		[commitCoordinateAtIndex, commitCoordinates, onPaste, parseCoordinatePair],
	);

	/**
	 * Handles coordinate change events for direct typing.
	 * @param index 0 for Latitude, 1 for Longitude
	 * @param raw The coordinate input string to parse.
	 */
	const handleCoordinateChange = useCallback((index: 0 | 1, raw: null | number | string | undefined) => {
		setCoordinates(prev => buildCoordsAtIndex(prev, index, parseCoordinateInput(raw)));
	}, [parseCoordinateInput]);

	/**
	 * Called on blur (focus out) of either input field; confirms typed value is complete
	 * and clamps entered value into the valid range.
	 * @param index 0 for Latitude, 1 for Longitude
	 */
	const handleBlur = useCallback(
		(index: 0 | 1, event: React.FocusEvent<HTMLInputElement>) => {
			const parsedValue = parseCoordinateInput(event.currentTarget.value.trim());
			const committedValue = parsedValue === undefined
				? undefined
				: roundCoordinate(parsedValue);
			commitCoordinateAtIndex(index, committedValue);
			setFocusedIndex(prev => (prev === index ? null : prev));
		},
		[commitCoordinateAtIndex, parseCoordinateInput],
	);

	//

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
					max={90}
					min={-90}
					onBlur={event => handleBlur(0, event)}
					onChange={val => handleCoordinateChange(0, val)}
					onFocus={() => handleFocus(0)}
					onPaste={event => handlePaste(0, event)}
					placeholder="Latitude (-90 to 90)"
					step={STEP}
					style={{ flex: 1 }}
					value={coordinates[0] ?? ''}
					{...getDecimalInputProps(0)}
				/>
				{/* Longitude input */}
				<NumberInput
					key="lon"
					disabled={disabled}
					max={180}
					min={-180}
					onBlur={event => handleBlur(1, event)}
					onChange={val => handleCoordinateChange(1, val)}
					onFocus={() => handleFocus(1)}
					onPaste={event => handlePaste(1, event)}
					placeholder="Longitude (-180 to 180)"
					step={STEP}
					style={{ flex: 1 }}
					value={coordinates[1] ?? ''}
					{...getDecimalInputProps(1)}
				/>
			</Section>
		</Section>
	);
}
