'use client';

import { FilterTarget } from '../FilterTarget';

/* * */

interface FilterTypeToggleProps {
	active?: boolean
	disabled?: boolean
	label: string
	onToggle?: () => void
}

/* * */

export function FilterTypeToggle({ active, disabled, label, onToggle }: FilterTypeToggleProps) {
	return (
		<FilterTarget
			active={active}
			disabled={disabled}
			label={label}
			onClick={onToggle}
		/>
	);
}
