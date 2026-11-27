'use client';

import { IconChecks } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface SelectAllButtonProps {
	label: string
	onChange: (values: string[]) => void
	selectedValues: string[]
	values: string[]
}

/* * */

export function SelectAllButton({ label, onChange, selectedValues, values }: SelectAllButtonProps) {
	const selected = new Set(selectedValues);
	if (values.every(value => selected.has(value))) return null;

	return (
		<button className={styles.selectAll} onClick={() => onChange(values)} type="button">
			<IconChecks size={16} aria-hidden />
			{label}
		</button>
	);
}
