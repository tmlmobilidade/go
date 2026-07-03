'use client';

import { useClipboard } from '@mantine/hooks';

import styles from './styles.module.css';

/* * */

interface CopyBadgeProps {
	label?: number | string
	size?: 'lg' | 'md'
	value: number | string
	withBorder?: boolean
}

/* * */

export function CopyBadge({ label, size = 'md', value, withBorder }: CopyBadgeProps) {
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
			className={styles.container}
			data-size={size}
			data-with-border={withBorder}
			onClick={handleCopy}
		>
			{clipboard.copied ? 'Copied' : label ? label : value}
		</div>
	);
}
