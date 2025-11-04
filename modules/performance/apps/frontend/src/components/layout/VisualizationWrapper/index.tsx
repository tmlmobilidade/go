'use client';

/* * */

import styles from './styles.module.css';

import { ContainerWrapper } from '../ContainerWrapper';
import { LiveIcon } from '../LiveIcon';

/* * */

export function VisualizationWrapper({ border, children, height, lastUpdated, padding, style, title, width = '100%' }: { border?: string, children: React.ReactNode, height?: number | string, lastUpdated?: Date, padding?: string, style?: React.CSSProperties, title?: string, width?: number | string }) {
	//

	//
	// A. Render components

	return (
		<ContainerWrapper border={border} height={height} padding={padding} style={style} width={width}>
			<div style={{ display: 'flex', gap: 'var(--size-spacing-xs)' }}>
				<p className={styles.title}>{title}</p>
				{lastUpdated && <LiveIcon updatedAt={lastUpdated} />}
			</div>
			{children}
		</ContainerWrapper>
	);
}
