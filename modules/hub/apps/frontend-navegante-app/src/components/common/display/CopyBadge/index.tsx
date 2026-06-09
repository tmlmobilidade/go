'use client';

import { useClipboard } from '@mantine/hooks';

import styles from './styles.module.css';

/* * */

interface CopyBadgeProps {
	hasBorder?: boolean
	label?: string
	size?: 'lg' | 'md'
	value: number | string
}

/* * */

export function CopyBadge({ hasBorder = true, label, size = 'md', value }: CopyBadgeProps) {
	//

	//
	// A. Setup variables

	const clipboard = useClipboard({ timeout: 600 });

	//
	// B. Handle actions

	const handleCopy = () => {
		clipboard.copy(String(value));
	};

	//
	// C. Render components

	return (
		<div
			className={`${styles.container} ${hasBorder && styles.hasBorder} ${styles[size]}`}
			data-has-border={hasBorder}
			data-size={size}
			onClick={handleCopy}
		>
			{clipboard.copied ? 'Copied' : label ? label : value}
		</div>
	);
}
