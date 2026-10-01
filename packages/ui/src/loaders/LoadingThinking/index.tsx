'use client';

import styles from './styles.module.css';

/* * */

export interface LoadingThinkingProps {
	size?: 'lg' | 'md' | 'sm'
	text?: string
	visible?: boolean
}

/* * */

export function LoadingThinking({ size = 'md', text = 'Loading', visible = true }: LoadingThinkingProps) {
	//

	if (!visible) {
		return null;
	}

	return (
		<div>
			<span className={styles.loader} data-size={size}>
				{text}
			</span>
		</div>
	);
}
