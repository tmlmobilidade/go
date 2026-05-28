'use client';

import { clampCoordinate } from '@tmlmobilidade/geo';
import { type ClipboardEvent, type FocusEvent, useCallback, useEffect, useRef, useState } from 'react';

import { Description } from '../../common';
import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';
import { NumberInput } from '../NumberInput';

/**
 * Type alias for a tuple representing latitude and longitude coordinates.
 * Each value can be a number or undefined.
 */
type Coords = [number | undefined, number | undefined];

/**
 * Type alias for raw input values which can be null, number, string, or undefined.
 */
type Raw = null | number | string | undefined;

/**
 * Returns a copy of the given coordinates tuple with the specified index (0 = lat, 1 = lng) patched to the new value.
 * @param coords The original coordinates tuple.
 * @param index 0 for latitude, 1 for longitude.
 * @param value The new value to insert.
 * @returns A new coordinates tuple with the patched value.
 */
const patch = (coords: Coords, index: 0 | 1, value: number | undefined): Coords =>
	index === 0 ? [value, coords[1]] : [coords[0], value];

/**
 * Attempts to parse a raw value (string, number, or null/undefined) as a finite number.
 * Returns undefined if the value cannot be reliably converted to a number.
 * @param raw The raw value to parse.
 * @returns The parsed number if valid, otherwise undefined.
 */
const parseRaw = (raw: Raw): number | undefined => {
	if (raw === '' || raw == null) return undefined;
	const n = typeof raw === 'number' ? raw : Number(raw);
	return Number.isFinite(n) ? n : undefined;
};

/**
 * Attempts to split a pasted text string into two coordinate parts.
 * Accepts tab or comma delimiters and trims whitespace.
 * Returns a tuple if two valid parts are found, otherwise null.
 *
 * @param text The pasted string.
 * @returns A tuple of [latitude, longitude] as strings, or null if not a valid format.
 */
const splitPastedCoords = (text: string): [string, string] | null => {
	const trimmed = text.trim();
	const separator = trimmed.includes('\t') ? '\t' : trimmed.includes(',') ? ',' : null;
	if (!separator) return null;

	const parts = trimmed.split(separator).map(part => part.trim()).filter(Boolean);
	return parts.length === 2 ? [parts[0], parts[1]] : null;
};

/**
 * Rounds/clamps a coordinate using clampCoordinate helper.
 * Returns the rounded number or undefined if the input is undefined or the clamp returns nullish.
 * @param value The coordinate value to round/clamp.
 * @returns The rounded value or undefined.
 */
const roundCoord = (value: number | undefined): number | undefined => {
	if (value === undefined) return undefined;
	const rounded = clampCoordinate(value);
	return rounded ?? undefined;
};

/**
 * Applies coordinate rounding/clamping to both latitude and longitude in a tuple.
 * @param coords The coordinates tuple.
 * @returns A new tuple with each coordinate rounded/clamped.
 */
const roundCoords = (coords: Coords): Coords => [
	roundCoord(coords[0]),
	roundCoord(coords[1]),
];

interface CoordinatesInputProps {
	description?: string
	disabled?: boolean
	label?: string
	onChange?: (changed: Coords | undefined) => void
	onPaste?: (pastedValues: string[]) => void
	value?: Coords | undefined
}

/**
 * Composite input for latitude/longitude coordinates.
 * Supports controlled and uncontrolled usage, rounds committed values to 6 decimals,
 * and keeps permissive numeric behavior for typed/pasted input.
 */
export function CoordinatesInput({ description, disabled = false, label, onChange, onPaste, value }: CoordinatesInputProps) {
	//

	//
	// A. Setup variables

	const initial = value ?? [undefined, undefined];
	const draftRef = useRef<Coords>(initial);
	const inputsRef = useRef<HTMLDivElement>(null);
	const isEditingRef = useRef(false);
	const [coords, setCoords] = useState<Coords>(initial);

	//
	// B. Handle effects

	useEffect(() => {
		if (isEditingRef.current) return;

		const next = value ?? [undefined, undefined];
		if (next[0] === draftRef.current[0] && next[1] === draftRef.current[1]) return;

		draftRef.current = next;
		setCoords(next);
	}, [value]);

	//
	// C. Handle actions

	const updateCoords = (next: Coords) => {
		draftRef.current = next;
		setCoords(next);
	};

	const handleFocus = useCallback(() => {
		isEditingRef.current = true;
	}, []);

	const handleChange = (index: 0 | 1, raw: Raw) => {
		updateCoords(patch(draftRef.current, index, parseRaw(raw)));
	};

	const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
		const nextTarget = event.relatedTarget;
		if (nextTarget instanceof Node && inputsRef.current?.contains(nextTarget)) return;

		isEditingRef.current = false;

		const rounded = roundCoords(draftRef.current);
		updateCoords(rounded);
		onChange?.(rounded);
	}, [onChange]);

	const handlePaste = useCallback((event: ClipboardEvent<HTMLInputElement>) => {
		const parts = splitPastedCoords(event.clipboardData.getData('text'));
		if (!parts) return;

		event.preventDefault();

		updateCoords([parseRaw(parts[0]), parseRaw(parts[1])]);
		onPaste?.(parts);
	}, [onPaste]);

	//
	// D. Render components

	return (
		<Section flexDirection="column" gap="xs" padding="none">
			{label && <Label>{label}</Label>}
			{description && <Description>{description}</Description>}
			<div ref={inputsRef} data-coordinates-input="" style={{ display: 'flex', flex: 1, gap: 'var(--size-spacing-sm)', width: '100%' }}>
				<NumberInput
					disabled={disabled}
					onBlur={handleBlur}
					onChange={value => handleChange(0, value)}
					onFocus={handleFocus}
					onPaste={handlePaste}
					placeholder="Latitude (-90 to 90)"
					style={{ flex: 1 }}
					value={coords[0] ?? ''}
				/>
				<NumberInput
					disabled={disabled}
					onBlur={handleBlur}
					onChange={value => handleChange(1, value)}
					onFocus={handleFocus}
					onPaste={handlePaste}
					placeholder="Longitude (-180 to 180)"
					style={{ flex: 1 }}
					value={coords[1] ?? ''}
				/>
			</div>
		</Section>
	);
}
