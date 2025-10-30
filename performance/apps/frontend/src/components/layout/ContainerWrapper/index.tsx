'use client';

/* * */

import styles from './styles.module.css';

/* * */

export function ContainerWrapper({ children, height, onClick, padding, style }: { children: React.ReactNode, height?: number | string, onClick?: () => void, padding?: string, style?: React.CSSProperties }) {
	//

	//
	// A. Render components

	if (onClick) {
		return (
			<button
				className={`${styles.container} ${styles.clickable}`}
				onClick={onClick}
				style={{ height, padding, ...style }}
				type="button"
			>
				{children}
			</button>
		);
	}

	return (
		<div className={styles.container} style={{ height, padding, ...style }}>
			{children}
		</div>
	);
}
