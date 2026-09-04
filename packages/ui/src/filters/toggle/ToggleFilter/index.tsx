'use client';

import { FilterTarget } from '../../shared/FilterTarget';

/* * */

interface ToggleFilterProps {
	active?: boolean
	disabled?: boolean
	label: string
	onToggle?: () => void
}

/* * */

export function ToggleFilter({ active, disabled, label, onToggle }: ToggleFilterProps) {
	return (
		<FilterTarget
			active={active}
			disabled={disabled}
			label={label}
			onClick={onToggle}
		/>
	);
}
