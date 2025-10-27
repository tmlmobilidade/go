'use client';

/* * */

import { LiveIcon } from '@/components/layout/LiveIcon';

import styles from './styles.module.css';

/* * */

export function VisualizationContainer({ children, height, padding, style, title, updatedAt }: { children: React.ReactNode, height?: number | string, padding?: string, style?: React.CSSProperties, title?: string, updatedAt?: Date }) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container} style={{ height, padding, ...style }}>

			{title && (
				<div className={styles.header}>
					{title && <h3 className={styles.title}>{title}</h3>}
					{updatedAt && <LiveIcon updatedAt={updatedAt} />}
				</div>
			)}

			{children}
		</div>
	);
}
