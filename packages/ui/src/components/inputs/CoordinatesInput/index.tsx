'use client';

import { useEffect, useState } from 'react';

import { Description } from '../../common';
import { Label } from '../../display';
import { Section } from '../../layout/Section';
import { NumberInput } from '../NumberInput';

const COORDINATE_DECIMALS = 6;
const STEP = 10 ** -COORDINATE_DECIMALS;

type CoordinatesTuple = [number | undefined, number | undefined];
type CoordinateInputRaw = null | number | string | undefined;

const roundCoordinate = (value: number) => parseFloat(value.toFixed(COORDINATE_DECIMALS));

const buildCoordsAtIndex = (
	prev: CoordinatesTuple,
	index: 0 | 1,
	valueAtIndex: number | undefined,
): CoordinatesTuple => (index === 0 ? [valueAtIndex, prev[1]] : [prev[0], valueAtIndex]);

interface CoordinatesInputProps {
	defaultValue?: [number, number]
	description?: string
	disabled?: boolean
	label?: string
	onChange?: (changed: CoordinatesTuple | undefined) => void
	onPaste?: (pastedValues: string[]) => void
	value?: CoordinatesTuple | undefined
}

/**
 * Composite input for latitude/longitude coordinates.
 * Supports controlled and uncontrolled usage, rounds committed values to 6 decimals,
 * and keeps permissive numeric behavior for typed/pasted input.
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
	const [coordinates, setCoordinates] = useState<CoordinatesTuple>(value ?? defaultValue ?? [undefined, undefined]);
	const [focusedIndex, setFocusedIndex] = useState<0 | 1 | null>(null);

	useEffect(() => {
		if (value === undefined) return;

		const nextLat = value[0] === undefined ? undefined : roundCoordinate(value[0]);
		const nextLng = value[1] === undefined ? undefined : roundCoordinate(value[1]);

		setCoordinates((prev) => {
			if (prev[0] === nextLat && prev[1] === nextLng) return prev;
			return [nextLat, nextLng];
		});
	}, [value]);

	function parseCoordinatePair(input: string): [number, number] | null {
		const parts = input
			.trim()
			.split(/[,\t\s]+/)
			.map(part => part.trim())
			.filter(Boolean);

		if (parts.length < 2) return null;

		const lat = Number(parts[0]);
		const lng = Number(parts[1]);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

		return [roundCoordinate(lat), roundCoordinate(lng)];
	}

	function parseCoordinateInput(raw: CoordinateInputRaw): number | undefined {
		if (raw === '' || raw === undefined || raw === null) return undefined;

		const parsed = typeof raw === 'number' ? raw : Number(raw);
		if (!Number.isFinite(parsed)) return undefined;

		return parsed;
	}

	function notifyChange(nextCoordinates: CoordinatesTuple): void {
		if (!onChange) return;

		if (nextCoordinates[0] === undefined && nextCoordinates[1] === undefined) {
			onChange(undefined);
			return;
		}

		onChange(nextCoordinates);
	}

	function commitCoordinates(nextCoordinates: CoordinatesTuple): void {
		setCoordinates(nextCoordinates);
		notifyChange(nextCoordinates);
	}

	function commitCoordinateAtIndex(index: 0 | 1, valueAtIndex: number | undefined): void {
		setCoordinates((prev) => {
			const nextCoordinates = buildCoordsAtIndex(prev, index, valueAtIndex);
			notifyChange(nextCoordinates);
			return nextCoordinates;
		});
	}

	function handleCoordinateChange(index: 0 | 1, raw: CoordinateInputRaw): void {
		setCoordinates(prev => buildCoordsAtIndex(prev, index, parseCoordinateInput(raw)));
	}

	function handleBlur(index: 0 | 1, event: React.FocusEvent<HTMLInputElement>): void {
		const parsedValue = parseCoordinateInput(event.currentTarget.value.trim());
		const committedValue = parsedValue === undefined
			? undefined
			: roundCoordinate(parsedValue);

		commitCoordinateAtIndex(index, committedValue);
		setFocusedIndex(prev => (prev === index ? null : prev));
	}

	function handlePaste(index: 0 | 1, event: React.ClipboardEvent<HTMLInputElement>): void {
		const pastedText = event.clipboardData.getData('text').trim();
		if (!pastedText) return;

		const pastedValues = pastedText
			.split(/[,\t\s]+/)
			.map(value => value.trim())
			.filter(Boolean);
		onPaste?.(pastedValues);

		const coordinatePair = parseCoordinatePair(pastedText);
		if (coordinatePair) {
			event.preventDefault();
			commitCoordinates(coordinatePair);
			return;
		}

		const numericValue = Number(pastedText);
		if (!Number.isFinite(numericValue)) return;

		event.preventDefault();
		commitCoordinateAtIndex(index, roundCoordinate(numericValue));
	}

	function getDecimalInputProps(index: 0 | 1) {
		if (focusedIndex === index) return {};

		return {
			decimalScale: COORDINATE_DECIMALS,
			fixedDecimalScale: true,
		};
	}

	function handleFocus(index: 0 | 1): void {
		setFocusedIndex(index);
	}

	return (
		<Section flexDirection="column" gap="xs" padding="none">
			<Label>{label}</Label>
			{description && <Description>{description}</Description>}

			<Section flexDirection="row" gap="sm" padding="none">
				<NumberInput
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
				<NumberInput
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
