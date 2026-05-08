'use client';

import styles from './styles.module.css';

/* * */

export function ContainerWrapper({ border, children, className, height, onClick, padding, style, width }: { border?: string, children: React.ReactNode, className?: string, height?: number | string, onClick?: () => void, padding?: string, style?: React.CSSProperties, width?: number | string }) {
	//

	//
	// A. Render components

	if (onClick) {
		return (
			<button
				className={`${styles.container} ${styles.clickable}`}
				onClick={onClick}
				style={{ border, height, padding, width, ...style }}
				type="button"
			>
				{children}
			</button>
		);
	}

	return (
		<div className={`${styles.container} ${className}`} style={{ border, height, padding, width, ...style }}>
			{children}
		</div>
	);
}
