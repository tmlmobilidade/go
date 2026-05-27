'use client';

import { useState } from 'react';

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
export function CoordinatesInput({
	description,
	disabled = false,
	label = 'Coordenadas',
	onChange,
	onPaste,
	value,
}: CoordinatesInputProps) {
	const [coords, setCoords] = useState<Coords>(value ?? [undefined, undefined]);

	const handleChange = (index: 0 | 1, raw: Raw) => {
		setCoords(prev => patch(prev, index, parseRaw(raw)));
	};

	return (
		<Section flexDirection="column" gap="xs" padding="none">
			{description && <Description>{description}</Description>}

			<Section flexDirection="row" gap="sm" padding="none">
				<NumberInput
					disabled={disabled}
					onChange={value => handleChange(0, value)}
					placeholder="Latitude (-90 to 90)"
					style={{ flex: 1 }}
					value={coords[0] ?? ''}
				/>
				<NumberInput
					disabled={disabled}
					onChange={value => handleChange(1, value)}
					placeholder="Longitude (-180 to 180)"
					style={{ flex: 1 }}
					value={coords[1] ?? ''}
				/>
			</Section>
		</Section>
	);
}
