'use client';

import { clampCoordinate } from '@tmlmobilidade/geo';
import { type ClipboardEvent, type FocusEvent, useCallback, useEffect, useRef, useState } from 'react';

import { Description } from '../../common';
import { Section } from '../../layout/Section';
import { NumberInput } from '../NumberInput';

type Coords = [number | undefined, number | undefined];
type Raw = null | number | string | undefined;

const patch = (coords: Coords, index: 0 | 1, value: number | undefined): Coords =>
	index === 0 ? [value, coords[1]] : [coords[0], value];

const parseRaw = (raw: Raw): number | undefined => {
	if (raw === '' || raw == null) return undefined;
	const n = typeof raw === 'number' ? raw : Number(raw);
	return Number.isFinite(n) ? n : undefined;
};

const splitPastedCoords = (text: string): [string, string] | null => {
	const trimmed = text.trim();
	const separator = trimmed.includes('\t') ? '\t' : trimmed.includes(',') ? ',' : null;
	if (!separator) return null;

	const parts = trimmed.split(separator).map(part => part.trim()).filter(Boolean);
	return parts.length === 2 ? [parts[0], parts[1]] : null;
};

const roundCoord = (value: number | undefined): number | undefined => {
	if (value === undefined) return undefined;
	const rounded = clampCoordinate(value);
	return rounded ?? undefined;
};

const roundCoords = (coords: Coords): Coords => [
	roundCoord(coords[0]),
	roundCoord(coords[1]),
];

interface CoordinatesInputProps {
	description?: string
	disabled?: boolean
	onChange?: (changed: Coords | undefined) => void
	onPaste?: (pastedValues: string[]) => void
	value?: Coords | undefined
}

/**
 * Composite input for latitude/longitude coordinates.
 * Supports controlled and uncontrolled usage, rounds committed values to 6 decimals,
 * and keeps permissive numeric behavior for typed/pasted input.
 */
export function CoordinatesInput({
	description,
	disabled = false,
	onChange,
	onPaste,
	value,
}: CoordinatesInputProps) {
	const initial = value ?? [undefined, undefined];
	const draftRef = useRef<Coords>(initial);
	const inputsRef = useRef<HTMLDivElement>(null);
	const isEditingRef = useRef(false);
	const [coords, setCoords] = useState<Coords>(initial);

	useEffect(() => {
		if (isEditingRef.current) return;

		const next = value ?? [undefined, undefined];
		if (next[0] === draftRef.current[0] && next[1] === draftRef.current[1]) return;

		draftRef.current = next;
		setCoords(next);
	}, [value]);

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

	return (
		<Section flexDirection="column" gap="xs" padding="none">
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
