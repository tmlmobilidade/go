'use client';

/* * */

import { Chip, Group } from '@mantine/core';
import React from 'react';

/* * */

export type ChipGroupValue = number | string;

export interface ChipGroupOption<T extends ChipGroupValue> {
	ariaLabel?: string
	disabled?: boolean
	label: string
	value: T
}

/* * */

export interface SelectChipGroupProps<T extends ChipGroupValue> {
	className?: string
	/**
	 * Called with:
	 * - a value when user selects a chip
	 * - null when user clicks the already-selected chip (deselect)
	 */
	onChange: (value: null | T) => void

	options: ChipGroupOption<T>[]

	size?: 'lg' | 'md' | 'sm' | 'xs'

	/**
	 * Controlled selected value.
	 * Use `null` when nothing is selected.
	 */
	value: null | T
}

/* * */

export function SelectChipGroup<T extends ChipGroupValue>({
	className,
	onChange,
	options,
	size = 'sm',
	value,
}: SelectChipGroupProps<T>) {
	return (
		<Group className={className} gap="xs">
			{options.map((opt) => {
				const checked = value === opt.value;

				return (
					<Chip
						key={String(opt.value)}
						aria-label={opt.ariaLabel ?? opt.label}
						checked={checked}
						color="var(--color-primary)"
						disabled={opt.disabled}
						size={size}
						onClick={() => {
							// Mantine Chip doesn't have "deselect on same click" by default,
							// so we implement it ourselves.
							onChange(checked ? null : opt.value);
						}}
					>
						{opt.label}
					</Chip>
				);
			})}
		</Group>
	);
}
