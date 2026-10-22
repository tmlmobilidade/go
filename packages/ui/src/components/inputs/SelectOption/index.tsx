'use client';

import styles from './styles.module.css';

/* * */

interface SelectOptionProps {
	option: {
		description?: string
		label: string
	}
}

/* * */

/** Shared option label for selects and list filters. */
export function SelectOption({ option }: SelectOptionProps) {
	return (
		<span className={styles.label}>
			{option.label}
			{option.description && <span className={styles.description}> {option.description}</span>}
		</span>
	);
}
